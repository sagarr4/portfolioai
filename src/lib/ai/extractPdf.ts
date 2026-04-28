import PDFParser from 'pdf2json'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1)

    pdfParser.on('pdfParser_dataError', (err: any) => {
      reject(new Error(err.parserError))
    })

    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent()
      resolve(text)
    })

    pdfParser.parseBuffer(buffer)
  })
}