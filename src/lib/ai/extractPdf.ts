import PDFParser from 'pdf2json'

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // pdf2json ships no official TypeScript types; the `any` casts
    // below are a deliberate, narrow exception for this untyped
    // third-party constructor, not a shortcut around our own code.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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