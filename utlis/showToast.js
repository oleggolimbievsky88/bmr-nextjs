/**
 * Utility function to show Bootstrap toast notifications
 * @param {string} message - The message to display in the toast
 * @param {string} type - The type of toast: 'success', 'error', 'info', 'warning' (default: 'success')
 * @param {number} duration - Duration in milliseconds before auto-hiding (default: 3000)
 */
export const showToast = (message, type = 'success', duration = 3000) => {
	if (typeof window === 'undefined') return

	// Get toast container (should exist in layout)
	let toastContainer = document.getElementById('toast-container')
	if (!toastContainer) {
		// Fallback: create container if it doesn't exist
		toastContainer = document.createElement('div')
		toastContainer.id = 'toast-container'
		toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3'
		toastContainer.style.zIndex = '1090'
		document.body.appendChild(toastContainer)
	}

	// Create unique toast ID
	const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

	// Determine toast classes based on type
	const bgClass = type === 'success' ? 'bg-success' 
		: type === 'error' ? 'bg-danger' 
		: type === 'warning' ? 'bg-warning' 
		: 'bg-info'

	// Create toast HTML
	const toastHTML = `
		<div id="${toastId}" class="toast ${bgClass} text-white" role="alert" aria-live="assertive" aria-atomic="true">
			<div class="toast-header ${bgClass} text-white border-0">
				<strong class="me-auto">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info'}</strong>
				<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
			<div class="toast-body">
				${message}
			</div>
		</div>
	`

	// Insert toast into container
	toastContainer.insertAdjacentHTML('beforeend', toastHTML)

	// Get the toast element
	const toastElement = document.getElementById(toastId)

	// Initialize and show toast using Bootstrap
	const bootstrap = require('bootstrap')
	const toast = new bootstrap.Toast(toastElement, {
		autohide: true,
		delay: duration,
	})

	toast.show()

	// Remove toast element from DOM after it's hidden
	toastElement.addEventListener('hidden.bs.toast', () => {
		toastElement.remove()
		// Remove container if it's empty
		if (toastContainer.children.length === 0) {
			toastContainer.remove()
		}
	})
}
