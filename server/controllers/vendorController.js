import { Vendor, User } from '../models/index.js';

export const createVendor = async (req, res) => {
  try {
    const { vendorName, contactDetails, address, gstNumber } = req.body;
    const vendor = await Vendor.create({
      vendorName,
      contactDetails,
      address,
      gstNumber,
      createdBy: req.user._id
    });
    res.status(201).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ]
    });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'email']
        }
      ]
    });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    await vendor.update(req.body);
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    await vendor.destroy();
    res.json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};