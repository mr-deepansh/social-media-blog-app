// API Configuration
const API_BASE_URL = "http://localhost:5000/api/v1";
let userId; // This will be set from the URL

// Function to get user ID from URL
function getUserIdFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get("userId");
}

// Create an Axios instance with default headers
const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// API Functions
async function fetchUserProfile(userId) {
	try {
		const response = await api.get(`/users/${userId}`);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching user profile:", error);
		throw error;
	}
}

async function fetchFollowers(userId) {
	try {
		const response = await api.get(`/users/${userId}/followers`);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching followers:", error);
		throw error;
	}
}

async function fetchFollowing(userId) {
	try {
		const response = await api.get(`/users/${userId}/following`);
		return response.data.data;
	} catch (error) {
		console.error("Error fetching following:", error);
		throw error;
	}
}

async function updateUserProfile(userId, profileData) {
	try {
		const response = await api.put(`/users/${userId}`, profileData);
		return response.data.data;
	} catch (error) {
		console.error("Error updating profile:", error);
		throw error;
	}
}

// Utility Functions
function getInitials(name) {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase();
}

function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function getMemberDuration(joinDate) {
	const now = new Date();
	const joined = new Date(joinDate);
	const diffInMonths = Math.floor((now - joined) / (1000 * 60 * 60 * 24 * 30));

	if (diffInMonths < 12) {
		return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"}`;
	} else {
		const years = Math.floor(diffInMonths / 12);
		return `${years} ${years === 1 ? "year" : "years"}`;
	}
}

// DOM Update Functions
function updateProfileUI(userData) {
	document.getElementById("avatar-text").textContent = getInitials(
		userData.fullName || userData.username,
	);
	document.getElementById("profile-name").textContent =
		userData.fullName || userData.username;
	document.getElementById("username").textContent = `@${userData.username}`;
	document.getElementById("username-info").textContent =
		`@${userData.username}`;
	document.getElementById("bio").textContent =
		userData.bio || "No bio available";
	document.getElementById("posts-count").textContent = userData.postsCount || 0;
	document.getElementById("followers-count").textContent =
		userData.followersCount || 0;
	document.getElementById("following-count").textContent =
		userData.followingCount || 0;
	document.getElementById("total-posts").textContent = userData.postsCount || 0;

	if (userData.createdAt) {
		document.getElementById("join-date").textContent = formatDate(
			userData.createdAt,
		);
		document.getElementById("member-duration").textContent = getMemberDuration(
			userData.createdAt,
		);
	}
}

function showError(message) {
	document.getElementById("loading").style.display = "none";
	document.getElementById("profile-content").style.display = "none";
	document.getElementById("error").style.display = "block";
	document.getElementById("error-message").textContent = message;
}

function showProfile() {
	document.getElementById("loading").style.display = "none";
	document.getElementById("error").style.display = "none";
	document.getElementById("profile-content").style.display = "block";
}

// Modal Functions
async function showFollowers() {
	document.getElementById("followers-modal").style.display = "flex";
	try {
		const followers = await fetchFollowers(userId);
		renderUserList(followers, "followers-list");
	} catch (error) {
		document.getElementById("followers-list").innerHTML =
			"<p>Error loading followers</p>";
	}
}

async function showFollowing() {
	document.getElementById("following-modal").style.display = "flex";
	try {
		const following = await fetchFollowing(userId);
		renderUserList(following, "following-list");
	} catch (error) {
		document.getElementById("following-list").innerHTML =
			"<p>Error loading following</p>";
	}
}

function renderUserList(users, containerId) {
	const container = document.getElementById(containerId);
	if (!users || users.length === 0) {
		container.innerHTML = "<p>No users found</p>";
		return;
	}

	const userHTML = users
		.map(
			(user) => `
                <div class="user-item">
                    <div class="user-avatar-small">
                        ${getInitials(user.fullName || user.username)}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${user.fullName || user.username}</div>
                        <div style="color: #666; font-size: 14px;">@${user.username}</div>
                    </div>
                </div>
            `,
		)
		.join("");

	container.innerHTML = userHTML;
}

function closeFollowersModal() {
	document.getElementById("followers-modal").style.display = "none";
}

function closeFollowingModal() {
	document.getElementById("following-modal").style.display = "none";
}

// Edit Profile Function
function editProfile() {
	const currentBio = document.getElementById("bio").textContent;
	const newBio = prompt("Edit your bio:", currentBio);

	if (newBio !== null && newBio !== currentBio) {
		updateProfile({ bio: newBio });
	}
}

async function updateProfile(data) {
	try {
		const updatedUser = await updateUserProfile(userId, data);
		updateProfileUI(updatedUser);
		alert("Profile updated successfully!");
	} catch (error) {
		alert("Error updating profile. Please try again.");
	}
}

// Initialize Profile
async function initializeProfile() {
	userId = getUserIdFromUrl();
	if (!userId) {
		showError(
			'No user ID found in URL. Please provide a userId query parameter (e.g., "?userId=your_user_id").',
		);
		return;
	}

	try {
		const userData = await fetchUserProfile(userId);
		if (userData) {
			updateProfileUI(userData);
			showProfile();
		} else {
			showError("User not found.");
		}
	} catch (error) {
		showError(
			"Failed to load profile. Please check your connection and try again.",
		);
	}
}

// Close modals when clicking outside
window.onclick = function (event) {
	const followersModal = document.getElementById("followers-modal");
	const followingModal = document.getElementById("following-modal");

	if (event.target === followersModal) {
		followersModal.style.display = "none";
	}
	if (event.target === followingModal) {
		followingModal.style.display = "none";
	}
};

// Initialize the profile when page loads
document.addEventListener("DOMContentLoaded", initializeProfile);
