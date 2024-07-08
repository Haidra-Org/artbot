import toast from 'react-hot-toast'

interface ToastController {
  message: string | React.ReactNode
  type?: 'success' | 'error'
  timeout?: number
}

export const toastController = ({
  message,
  type = 'success',
  timeout = 3000
}: ToastController) => {
  // @ts-expect-error We can pass in a string or a React node
  toast[type](message, { duration: timeout })
}
