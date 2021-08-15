import { NotificationProgrammatic as Notification } from 'buefy'
export default (app, inject) => {
    // Inject $hello(msg) in Vue, context and store.

    inject('notify', (type, message) => {
        const options = {
            position: 'is-top-right',
            duration: 5000,
            queue: false,
            autoClose: true,
            message,
            type: (type == 'success') ? 'is-success' : 'is-danger'
        }
        Notification.open(options)
    })
}