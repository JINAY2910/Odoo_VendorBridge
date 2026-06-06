import { User, Vendor } from '../models/index.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Vendor, as: 'vendor', attributes: ['vendorName'] }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, vendorId } = req.body;
    
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      vendorId: role === 'VENDOR' ? (vendorId || null) : null
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, vendorId } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      role: role !== undefined ? role : user.role,
      vendorId: role === 'VENDOR' ? (vendorId !== undefined ? vendorId : user.vendorId) : null
    };

    if (password) {
      updateData.password = password;
    }

    await user.update(updateData);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId
    });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};
