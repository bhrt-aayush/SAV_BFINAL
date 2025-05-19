import userModel from '../models/userModel.js';

// Get total users with email (no password)
export const getTotalUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, 'name email isVerified');
        res.status(200).json({ 
            success: true,
            total: users.length, 
            users 
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching users' 
        });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await userModel.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting user' 
        });
    }
}; 