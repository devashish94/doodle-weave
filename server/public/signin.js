const signin = document.getElementById('signin')

signin.addEventListener('click', () => {
    console.log("clicked")
    if (document.getElementById('username').value == '' || document.getElementById('password').value == '') {
        alert("hey! Fill up the credentials");
    }
    else {
        fetch(`/login`, {
            method: "POST",
            body: JSON.stringify({
                username: document.getElementById('username').value,
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
                console.log(data)
                if (data.isUser) {
                    console.log('redirect')
                    window.location = `http://localhost:5173/?user_id=${data.user_id}`
                } else {
                    alert("WRONG USERNAME PASSWORD")
                }
            })
            .catch(err => {
                console.log(err.message)
            })
    }
})
