// Login logic
const loginForm = document.getElementById('loginForm')
loginForm.addEventListener('submit', e => {
  e.preventDefault()
  let data = new FormData(loginForm)
  let obj = {}
  data.forEach((value, key) => obj[key] = value)
  fetch('api/sessions/login', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then((res) => {
    if (res.status == 200) {
      window.location.href = '/'
    }
    return res
  })
  .then(res => res.json())
  .then(json => {
    if (json.status == 'error') {
      Swal.fire({
        icon: 'error',
        text: json.message,
        toast: true,
        position: "top-right",
        timer: 2000
      })
    }
  })
  .catch(error => console.log(error))
})