import Axios from 'axios'

let csrfToken = document.head.querySelector('meta[name="token"]');

export default Axios.create({
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken ? csrfToken.content : '',
        'X-Requested-With': 'XMLHttpRequest'
    }
});
