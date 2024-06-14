import toast from 'react-hot-toast'

interface ToastController {
  message: string
  type?: 'success' | 'error'
  timeout?: number
}

export const toastController = ({
  message,
  type = 'success',
  timeout = 3000
}: ToastController) => {
  toast[type](message, { duration: timeout })
}
