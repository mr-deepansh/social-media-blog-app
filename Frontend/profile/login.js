const API_BASE_URL = "http://localhost:5000/api/v1";

document.addEventListener("DOMContentLoaded", () => {
	const loginForm = document.getElementById("login-form");
	const errorMessage = document.getElementById("error-message");

	loginForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		errorMessage.textContent = "";

		const email = loginForm.email.value;
		const password = loginForm.password.value;

		try {
			const response = await axios.post(`${API_BASE_URL}/users/login`, {
				email,
				password,
			});

			if (response.data.success) {
				const { user, accessToken } = response.data.data;
				localStorage.setItem("user", JSON.stringify(user));
				localStorage.setItem("accessToken", accessToken);

				window.location.href = `user.profile.html?userId=${user._id}`;
			}
		} catch (error) {
			if (error.response && error.response.data) {
				errorMessage.textContent = error.response.data.message;
			} else {
				errorMessage.textContent = "An unexpected error occurred.";
			}
		}
	});
});
