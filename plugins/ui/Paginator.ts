import ICN from './Icons.json' assert { type: 'json'}

export default class Paginator {

  buttonCount = 0
  readonly id: number
  readonly closeId: number
  private pageCount: number

  constructor(id: number, closeId: number, pageCount: number) {
    this.id = id
    this.closeId = closeId
    this.pageCount = pageCount
    if (pageCount > 1) { this.buttonCount = 1 }
    if (pageCount > 3) { this.buttonCount = 2 }
    if (pageCount > 10) { this.buttonCount = 3 }
  }

  updatePageCount(pageCount: number) {
    this.pageCount = pageCount
    if (pageCount > 1) { this.buttonCount = 1 }
    if (pageCount > 3) { this.buttonCount = 2 }
    if (pageCount > 10) { this.buttonCount = 3 }
  }

  getPageFromClick(id: number, page: number) {
    switch (id) {
      case this.id + 1:
        page--
        if (page < 1) { return 1 }
        return page
      case this.id + 2: {
        const lastPage = this.pageCount
        page++
        if (page > lastPage) { return lastPage }
        return page
      } case this.id + 3:
        page -= 10
        if (page < 1) { return page = 1 }
        return page
      case this.id + 4: {
        const lastPage = this.pageCount
        page += 10
        if (page > lastPage) { return lastPage }
        return page
      } case this.id + 5:
        return 1
      case this.id + 6:
        return this.pageCount
      default:
        return 1
    }
  }

  constructXml(page: number) {
    if (this.buttonCount === 0) {
      return `<quad posn="39.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
      imagefocus="${ICN.X.orange}"
      image="${ICN.X.white}"/>`
    }
    let xml = ''
    if (page !== 1) {
      xml += `<quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 1}" 
        imagefocus="${ICN.arrowL.orange}"
        image="${ICN.arrowL.white}"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 5}" 
            imagefocus="${ICN.arrowMaxL.orange}"
            image="${ICN.arrowMaxL.white}"/>
            <quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 3}" 
            imagefocus="${ICN.arrowDoubleL.orange}"
            image="${ICN.arrowDoubleL.white}"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 5}" 
        imagefocus="${ICN.arrowMaxL.orange}"
        image="${ICN.arrowMaxL.white}"/>`
      }
    }
    else {
      xml += `<quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}"/>`
      if (this.buttonCount > 1) {
        xml += `<quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}"/>`
      }
      if (this.buttonCount > 2) {
        xml += `<quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}"/>`
      }
    }
    xml += `<quad posn="39.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
        imagefocus="${ICN.X.orange}"
        image="${ICN.X.white}"/>`
    if (page !== this.pageCount) {
      xml += `<quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 2}" 
      imagefocus="${ICN.arrowR.orange}"
      image="${ICN.arrowR.white}"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 4}" 
          imagefocus="${ICN.arrowDoubleR.orange}"
          image="${ICN.arrowDoubleR.white}"/>
          <quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 6}" 
          imagefocus="${ICN.arrowMaxR.orange}"
          image="${ICN.arrowMaxR.white}"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 6}" 
          imagefocus="${ICN.arrowMaxR.orange}"
          image="${ICN.arrowMaxR.white}"/>`
      }
    }
    else {
      xml += `<quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}"/>`
      if (this.buttonCount > 1) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}"/>`
      }
      if (this.buttonCount > 2) {
        xml += `<quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="${ICN.empty}" /> `
      }
    }
    return xml
  }
}