import pool from "../config/db.js";

export const getAllUsersService = async () => {
    try {
        const query = `
        -- UPDATED - PROFILE PHOTO FEATURE: include avatar and profile fields for admin user cards.
        SELECT id, full_name, username, email, profile_photo_url, bio, expertise, experience, role_id FROM users
        `;

        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        throw error;
    }
};

export const getUserDetailService = async (usrId) => {
    try {
        const query = `
        SELECT * FROM users WHERE id = $1
        `
        const { rows } = await pool.query(query, [usrId]);
        return rows;
    } catch (error) {
        throw error;
    }
};

export const deleteUserService = async (userId) => {
    try {
        const query = `
        DELETE FROM users WHERE id = $1
        AND role_id != (SELECT id FROM roles WHERE role_name = 'super_admin')
        AND role_id != (SELECT id FROM roles WHERE role_name = 'admin')
        `;

        await pool.query(query, [userId]);
    } catch (error) {
        throw new Error("Unauthorized");
    }
};

export const upgradeUserToAdmin = async (userId) => {
    try {
        const query = `
        UPDATE users 
        SET role_id = (SELECT id FROM roles
            where role_name = 'admin')
        WHERE id = $1
        `;

        const result = await pool.query(query, [userId]);

        if (result.rowCount === 0) {
            throw new Error("User not found");
        }
    } catch (error) {
        throw error;
    }
};

// Downgrade Admin to regular user
export const downgradeAdminService = async (downgradedTo, userId) => {
    try {
        const query = `
        UPDATE users 
        SET role_id = (SELECT id FROM roles
            where role_name = $1)
        WHERE id = $2
        `;

        const result = await pool.query(query, [downgradedTo, userId]);

        if (result.rowCount === 0) {
            throw new Error("User not found");
        }
    } catch (error) {
        throw error;
    }
};

export const deleteAdminService = async (userId, superAdmin) => {
    try {
        if (userId === superAdmin) {
            throw new Error("Super Admin can not delete its own acount!");
        }

        const query = `
        DELETE FROM users WHERE id = $1
        AND role_id != (SELECT id FROM roles WHERE role_name = 'super_admin')
        `;

        const result = await pool.query(query,[userId]);

        if (result.rowCount === 0) {
            throw new Error("User not found");
        }
        
        return "deleted successfully";
    } catch (error) {
        throw new Error("Unauthorized");
    }
}

