$(document).ready(function () {
  const pdfFileInput = $("#pdfFile")
  const convertBtn = $("#convertBtn")
  const loader = $("#loader")
  const pdfPreviewContainer = $("#pdfPreviewContainer")
  const pdfPreview = $("#pdfPreview")
  const result = $("#result")

  pdfFileInput.on("change", function (event) {
    const file = event.target.files[0]
    if (file && file.type === "application/pdf") {
      previewPDF(file)
    }
  })

  convertBtn.on("click", function () {
    const file = pdfFileInput[0].files[0]
    if (file) {
      const formData = new FormData()
      formData.append("pdfFile", file)
      loader.show()
      $.ajax({
        url: "/convert",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
          loader.hide()
          if (response.fileUrl) {
            result.html(
              `<a href="${response.fileUrl}" class="btn btn-success">Download Converted File</a>`
            )
          } else {
            result.html(
              `<div class="alert alert-danger">${response.error}</div>`
            )
          }
        },
        error: function () {
          loader.hide()
          result.html(
            '<div class="alert alert-danger">An error occurred during the conversion.</div>'
          )
        },
      })
    }
  })

  function previewPDF(file) {
    const fileReader = new FileReader()
    fileReader.onload = function () {
      const arrayBuffer = this.result
      pdfjsLib.getDocument({ data: arrayBuffer }).promise.then((pdf) => {
        pdf.getPage(1).then((page) => {
          const viewport = page.getViewport({ scale: 1 })
          pdfPreview.attr("width", viewport.width)
          pdfPreview.attr("height", viewport.height)
          const context = pdfPreview[0].getContext("2d")
          page.render({ canvasContext: context, viewport: viewport })
          pdfPreviewContainer.show()
        })
      })
    }
    fileReader.readAsArrayBuffer(file)
  }
})
