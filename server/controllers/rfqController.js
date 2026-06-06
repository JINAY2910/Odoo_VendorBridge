import { RFQ, User } from '../models/index.js';

// Auto-generate RFQ number (e.g., RFQ-2026-0001)
const generateRFQNumber = async () => {
  const count = await RFQ.count();
  const year = new Date().getFullYear();
  return `RFQ-${year}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createRFQ = async (req, res) => {
  try {
    const { title, description, items, deadline, assignedVendors } = req.body;
    
    if (!title || !items || !deadline) {
      return res.status(400).json({ message: 'Title, items, and deadline are required' });
    }

    const rfqNumber = await generateRFQNumber();

    const rfq = await RFQ.create({
      rfqNumber,
      title,
      description,
      items,
      deadline,
      assignedVendors: assignedVendors || [],
      createdBy: req.user._id,
      status: 'open'
    });

    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ]
    });
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const updateRFQ = async (req, res) => {
  try {
    const { title, description, items, deadline, status, assignedVendors } = req.body;
    const rfq = await RFQ.findByPk(req.params.id);
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' });

    await rfq.update({
      title: title !== undefined ? title : rfq.title,
      description: description !== undefined ? description : rfq.description,
      items: items !== undefined ? items : rfq.items,
      deadline: deadline !== undefined ? deadline : rfq.deadline,
      status: status !== undefined ? status : rfq.status,
      assignedVendors: assignedVendors !== undefined ? assignedVendors : rfq.assignedVendors
    });

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};
