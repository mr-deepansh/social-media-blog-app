const API_BASE_URL = "http://localhost:5000/api/v1";

document.addEventListener("DOMContentLoaded", () => {
	const registerForm = document.getElementById("register-form");
	const errorMessage = document.getElementById("error-message");

	registerForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		errorMessage.textContent = "";

		const username = registerForm.username.value;
		const email = registerForm.email.value;
		const firstName = registerForm.firstName.value;
		const lastName = registerForm.lastName.value;
		const password = registerForm.password.value;
		const confirmPassword = registerForm.confirmPassword.value;

		if (password !== confirmPassword) {
			errorMessage.textContent = "Passwords do not match.";
			return;
		}

		try {
			const response = await axios.post(`${API_BASE_URL}/users/register`, {
				username,
				email,
				firstName,
				lastName,
				password,
				confirmPassword,
			});

			if (response.data.success) {
				alert("Registration successful! Please login.");
				window.location.href = "login.html";
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
