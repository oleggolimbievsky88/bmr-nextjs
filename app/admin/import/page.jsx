'use client'

import { useState } from 'react'

export default function ImportPage() {
	const [status, setStatus] = useState('')
	const [debug, setDebug] = useState(null)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setStatus('Uploading...')
		setDebug(null)

		const formData = new FormData()
		const fileInput = e.target.querySelector('input[type="file"]')
		formData.append('file', fileInput.files[0])

		try {
			const response = await fetch('/api/admin/import', {
				method: 'POST',
				body: formData,
			})

			const data = await response.json()

			if (data.success) {
				setStatus(`Success: ${data.message}`)
			} else {
				setStatus(`Error: ${data.error}`)
			}

			if (data.debug) {
				setDebug(data.debug)
			}
		} catch (err) {
			console.error('Import failed:', err)
			setStatus('Import failed: ' + err.message)
		}
	}

	return (
		<div>
			<div className="admin-page-header">
				<h1 className="admin-page-title">Import PIES Data</h1>
			</div>
			<div className="admin-card">
				<form onSubmit={handleSubmit}>
					<div className="admin-form-group mb-4">
						<label htmlFor="pies-file">PIES XML File</label>
						<input
							type="file"
							accept=".xml"
							required
							className="form-control"
							name="file"
							id="pies-file"
						/>
					</div>
					<button type="submit" className="admin-btn-primary">
						Import
					</button>
				</form>
			</div>

			{status && (
				<div
					className={
						status.startsWith('Error') || status.startsWith('Import failed')
							? 'admin-alert-error'
							: 'admin-card'
					}
					style={
						status.startsWith('Success')
							? {
									background: '#d1fae5',
									borderColor: '#10b981',
									color: '#065f46',
								}
							: undefined
					}
				>
					{status}
				</div>
			)}

			{debug && (
				<div className="admin-card">
					<h2 className="h6 fw-6 mb-3">Debug Info</h2>
					<ul className="mb-4">
						<li>Total Items: {debug.totalItems}</li>
						{debug.xmlVersion && (
							<li>PIES Version: {debug.xmlVersion}</li>
						)}
						{debug.sampleItem && (
							<li>
								Sample Item: {debug.sampleItem.partNumber} (
								{debug.sampleItem.brand})
							</li>
						)}
					</ul>
					{debug.sampleData?.attributes && (
						<div>
							<h3 className="h6 fw-6 mb-2">Product Attributes</h3>
							<div className="admin-table-wrap">
								<table className="admin-table">
									<thead>
										<tr>
											<th>Attribute</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
										{debug.sampleData.attributes.map((attr, i) => (
											<tr key={i}>
												<td className="fw-6">{attr.name}</td>
												<td>{attr.value}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
