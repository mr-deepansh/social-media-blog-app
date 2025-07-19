// src/shared/middleware/rbac.middleware.js
const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		const userRole = req.user?.role;

		if (!userRole || !allowedRoles.includes(userRole)) {
			return res.status(403).json({ message: "Forbidden: Access Denied" });
		}

		next();
	};
};

export default authorizeRoles;
