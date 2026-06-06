import { Vendor, User } from '../models/index.js';

export const createVendor = async (req, res) => {
  try {
    const { name, vendorName, email, phone, contactDetails, address, gstNumber, category, status } = req.body;
    const vendor = await Vendor.create({
      vendorName: vendorName || name,
      email,
      phone: phone || contactDetails,
      address,
      gstNumber,
      category: category || 'Services',
      status: status || 'active',
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
    const { name, vendorName, email, phone, contactDetails, address, gstNumber, category, status } = req.body;
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    await vendor.update({
      vendorName: vendorName !== undefined ? vendorName : (name !== undefined ? name : vendor.vendorName),
      email: email !== undefined ? email : vendor.email,
      phone: phone !== undefined ? phone : (contactDetails !== undefined ? contactDetails : vendor.phone),
      address: address !== undefined ? address : vendor.address,
      gstNumber: gstNumber !== undefined ? gstNumber : vendor.gstNumber,
      category: category !== undefined ? category : vendor.category,
      status: status !== undefined ? status : vendor.status
    });
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