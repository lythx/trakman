export default class Paginator {

  buttonCount = 0
  readonly id: number
  readonly closeId: number
  private pageCount: number

  constructor(id: number, closeId: number, pageCount: number) {
    console.log(id)
    console.log(pageCount)
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
      return `<quad posn="39.6 -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
      imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
      image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    }
    let xml = ''
    if (page !== 1) {
      xml += `<quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 1}" 
        imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552527298601/prevek8.png"
        image="https://cdn.discordapp.com/attachments/599381118633902080/986427882190553088/prevek8w.png"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 5}" 
            imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551449370634/firstek8.png"
            image="https://cdn.discordapp.com/attachments/599381118633902080/986427881192296448/firstek8w.png"/>
            <quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 3}" 
            imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551835250738/jumpekbw8.png"
            image="https://cdn.discordapp.com/attachments/599381118633902080/986427881590779934/jumpekbw8w.png"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 5}" 
        imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551449370634/firstek8.png"
        image="https://cdn.discordapp.com/attachments/599381118633902080/986427881192296448/firstek8w.png"/>`
      }
    }
    else {
      xml += `<quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
      if (this.buttonCount > 1) {
        xml += `<quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
      }
      if (this.buttonCount > 2) {
        xml += `<quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
      }
    }
    xml += `<quad posn="39.6 -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
        imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
        image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    if (page !== this.pageCount) {
      xml += `<quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 2}" 
      imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552246276187/nextek8.png"
      image="https://cdn.discordapp.com/attachments/599381118633902080/986427881985048616/nextek8w.png"/>`
      if (this.buttonCount > 2) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 4}" 
          imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551654887514/jumpek8.png"
          image="https://cdn.discordapp.com/attachments/599381118633902080/986427881402019941/jumpek8w.png"/>
          <quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 6}" 
          imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552019816489/lastek8.png"
          image="https://cdn.discordapp.com/attachments/599381118633902080/986427881792086046/lastek8w.png"/>`
      }
      else if (this.buttonCount > 1) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 6}" 
          imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552019816489/lastek8.png"
          image="https://cdn.discordapp.com/attachments/599381118633902080/986427881792086046/lastek8w.png"/>`
      }
    }
    else {
      xml += `<quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
      if (this.buttonCount > 1) {
        xml += `<quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
      }
      if (this.buttonCount > 2) {
        xml += `<quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png" /> `
      }
    }
    return xml
  }
}