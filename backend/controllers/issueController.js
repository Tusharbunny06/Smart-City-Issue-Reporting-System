const Issue = require('../models/Issue');
const User = require('../models/User');

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    // Parse location if it's sent as a stringified object from formData
    let parsedLocation = {};
    if (location && typeof location === 'string') {
        try {
            parsedLocation = JSON.parse(location);
        } catch(e) { /* ignore */ }
    } else if (location) {
        parsedLocation = location;
    }

    let assignedWorker = null;
    const currentHour = new Date().getHours();
    
    // Find workers with the matching specialty
    const availableWorkers = await User.find({ role: 'worker', specialty: category });
    
    for (let worker of availableWorkers) {
        if (worker.shiftStart !== undefined && worker.shiftEnd !== undefined) {
            let isAvailable = false;
            if (worker.shiftStart <= worker.shiftEnd) {
                isAvailable = currentHour >= worker.shiftStart && currentHour < worker.shiftEnd;
            } else {
                isAvailable = currentHour >= worker.shiftStart || currentHour < worker.shiftEnd;
            }
            if (isAvailable) {
                assignedWorker = worker._id;
                break;
            }
        }
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      imageUrl,
      location: parsedLocation,
      userId: req.user._id,
      assignedTo: assignedWorker
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'citizen') {
      query.userId = req.user._id;
    } else if (req.user.role === 'worker') {
      query.assignedTo = req.user._id;
    }
    // admin gets all

    const issues = await Issue.find(query)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
        
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email');
        
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    if (req.user.role === 'citizen' && issue.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Citizen shouldn't update status
    if (req.user.role === 'citizen') {
        return res.status(403).json({ message: 'Not authorized' });
    }

    // Workers can only update assigned issues
    if (req.user.role === 'worker' && (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized for this issue' });
    }

    issue.status = status;
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignWorker = async (req, res) => {
    try {
        const { workerId } = req.body;
        const issue = await Issue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        
        issue.assignedTo = workerId;
        await issue.save();
        
        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
