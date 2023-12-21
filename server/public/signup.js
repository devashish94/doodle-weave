const signup = document.getElementById('signup')

signup.addEventListener('click', () => {
    if (document.getElementById('username').value == '' || document.getElementById('email').value == '' || document.getElementById('password').value == '') {
        alert("hey! Fill up the credentials");
    }
    else {
        fetch(`/register`, {
            method: "POST",
            body: JSON.stringify({
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
            .then(function (res) {
                return res.json()
            })
            .then(data => {
                if (data.register) {
                    window.location = "/"
                }
            })
    }
})
