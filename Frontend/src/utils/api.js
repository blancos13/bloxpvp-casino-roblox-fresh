import Cookies from 'js-cookie'

function getJWT () {
    return Cookies.get('jwt')
}

export { getJWT }