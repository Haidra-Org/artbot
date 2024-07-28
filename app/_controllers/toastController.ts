import toast from 'react-hot-toast'

interface ToastController {
  message: string | React.ReactNode
  id?: string
  type?: 'success' | 'error'
  timeout?: number
}

interface ToastOptions {
  duration: number
  id?: string
}

export const toastController = ({
  message,
  id = '',
  type = 'success',
  timeout = 3000
}: ToastController) => {
  const options: ToastOptions = {
    duration: timeout
  }

  if (id) {
    options.id = id
  }

  // @ts-expect-error We can pass in a string or a React node
  toast[type](message, options)
}
