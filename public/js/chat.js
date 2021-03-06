const socket = io()

const $messageForm = document.querySelector('#text')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocation = document.querySelector('#location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemp = document.querySelector('#sidebar-template').innerHTML
const {username , room}  =Qs.parse(location.search , {ignoreQueryPrefix : true })

const autoscroll = () => {
  
    const $newMessage = $messages.lastElementChild

 
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    
    const containerHeight = $messages.scrollHeight

   
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageForm.setAttribute('disable', 'disable')
    const message = e.target.elements.message.value

    socket.emit('sendmessage', message, (error) => {
        message: message.text
        $messageForm.removeAttribute('disable')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            console.log('error')
        }
        else {
            console.log('Meassage delivered')
        }
    })
})

socket.on('roomData' , ( {room,users}) => {
    console.log(room)
    console.log(users)
const html = Mustache.render(sideBarTemp,{
    room,
    users
})
document.querySelector('#sidebar').innerHTML = html
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('location-message', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username : message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})




$sendLocation.addEventListener('click', () => {
    $sendLocation.setAttribute('disable', 'disable')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported in your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)

        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disable')
            console.log('location shared')
        }
        )
    })
})
socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error)
        location.href = '/'

    }
})