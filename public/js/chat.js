const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageSendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username , room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll = ()=> {
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffSet = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('Message',(message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAT: moment(message.createdAT).format('h:mm a')
    } )
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('locationMessage',(message) => {
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAT: moment(message.createdAT).format('h:mm a')
    } )
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

} )

socket.on('roomData',({ room,users }) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    
    //disable
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message,(error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        //enable
        if (error) {
            return console.log(error)
        }

        console.log('msg delivered')
    })
})
$messageSendLocation.addEventListener('click',() => {
   if (!navigator.geolocation){
       return alert('Geolocation is not supported by your browser!!!..')
   }

   $messageSendLocation.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position) => {
       socket.emit('sendLocation',{
           latitude : position.coords.latitude,
           longitude : position.coords.longitude},() => {
               $messageSendLocation.removeAttribute('disabled')
               console.log('the location is shared!!..')
           })
   })
})

socket.emit('join',{ username, room },(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})