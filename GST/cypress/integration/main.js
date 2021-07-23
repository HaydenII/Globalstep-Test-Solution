/// <reference types="Cypress" />
/// <reference types="cypress-downloadfile"/>

describe("EMC Pharmaceutical Automation Tests", () => {
    let BASEURL = "https://www.medicines.org.uk"

    var pharmaData = { 
        pharmas : [] 
    };

    it.only("Click through alphabetical list", () => {
        cy.visit("https://www.medicines.org.uk/emc/browse-companies")

        let selectobj = [ 
            0, 2, -1,
        ]
                
        // Click through alphabetical list
        cy.get(".browse > li a")
        .each((item, index, list) => {
            // ---
            cy.wrap(item).invoke('attr', 'href').then((inhref) =>{
                cy.visit(BASEURL + inhref) // Visit alpha page
                // Iterate through each selectobj and grab them from the alpha page if it exists
                cy.wrap(selectobj).each((selpos) =>{
                    // Get list from selector in selpos
                    cy.get('.key').then((initem) => {
                        // If the grabbed list contains the right number of elements continue
                        //cy.log("selpos:" + selpos.pos + " | list length: " + initem.length)
                        if(initem.length > (selpos>-1 ? selpos : 0)){
                            //grab item out of list
                            cy.wrap(initem).eq(selpos).then((firstItem) => {
                                cy.wrap(firstItem).invoke('attr', 'href').then((inhref) =>{
                                    // Grab the href from the item in the list ad visit it
                                    cy.visit(BASEURL + inhref).then(() => {
                                        grabWebsiteData(".col-md-5 > .gfdCompanyDetailsCol", ".col-md-4 > .gfdCompanyDetailsCol", ".companyLogoWrapper img", "h1")
                                    })
                                })
                            }).then(() => cy.go('back'))
                        }
                    })
                })
            })
            // ---
        }).then(()=>{
            // Save scraped data
            cy.writeFile("pharma_data.json", JSON.stringify(pharmaData))
        })
    })

    function grabWebsiteData(list1, list2, imageselector, intitle){
        let titles = [];
        let data = [];

        var jsonData = {};

        // Get general data per data block on page
        let expecttitle = true;
        cy.wrap([list1, list2]).each((inList) =>{
            cy.get(inList).children("*").each((childelem)=> {
                // Check if childelement contains p tag
                // If contains p it's data, if not it's a title
                if(childelem.find('p').length > 0){ 
                    // Assume it's a value
                    if (expecttitle){
                        titles.push("null")
                    }
                    data.push(childelem.text())
                    expecttitle = true
                }else{ 
                    // Assume it's a title
                    if (!expecttitle){
                        data.push("null")
                    }
                    titles.push(childelem.text())
                    expecttitle = false
                }
            })

        }).then(() => {
        // ---

        // Get title
        cy.get(intitle).then((titleelem) =>{
            jsonData["title"] = titleelem.text()
        })
        .then(() =>{
        // ---

        // Get and download image
        cy.get(imageselector).then((imgelem) =>{
            cy.wrap(imgelem).invoke('attr', 'src').then((insrc) =>{
                jsonData["image src"] = insrc
                cy.downloadFile("https://www.medicines.org.uk" + insrc,'DL_images', jsonData["title"] + '.jpg','MyCustomAgentName')
            })
        }).then(() =>{
        // ---

        // Insert data into dictionary
        for(let i = 0; i < titles.length; i++){
            jsonData[titles[i]] = data[i].replace(/[\n\t]/g, '')
        }
        pharmaData.pharmas.push(jsonData)
        // ---

        })
        })
        })

    }
})