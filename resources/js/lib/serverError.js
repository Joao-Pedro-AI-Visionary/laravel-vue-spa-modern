let shown = false

/**
 * Show a modal for 5xx responses. Laravel debug pages (text/html) are shown
 * in a sandboxed iframe, as in the original app.
 */
export async function showServerError (response, t) {
  if (shown) return
  shown = true

  const { default: Swal } = await import('sweetalert2')
  const contentType = String((response.headers && response.headers['content-type']) || '')

  if (contentType.includes('text/html') && typeof response.data === 'string') {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', '')
    iframe.title = t('error_alert_title')
    iframe.srcdoc = response.data

    await Swal.fire({
      html: iframe.outerHTML,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: { container: 'server-error-modal' },
      grow: 'fullscreen',
      padding: 0
    })
  } else {
    await Swal.fire({
      icon: 'error',
      title: t('error_alert_title'),
      text: t('error_alert_text'),
      confirmButtonText: t('ok')
    })
  }

  shown = false
}
