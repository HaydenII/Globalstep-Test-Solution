/// <reference types="Cypress" />

describe("herokuapp", () => {
    beforeEach(() => {
        cy.visit("https://the-internet.herokuapp.com/")
    })

    //Presentation 1
    context("Checkboxes", () => {
        it("Checkboxes", () => {
            cy.visit("https://the-internet.herokuapp.com/checkboxes")
            let numOfBoxes = 0;
    
            cy.get('form >input').should('have.length', 2)
    
            cy.get('form >input').each((item, index, list) =>{
                if (index === 1){
                    cy.wrap(item).should('be.checked')
                }else{
                    cy.wrap(item).should('not.be.checked')
                }
                cy.wrap(item).check()
    
                cy.wrap(item).should('be.checked')
    
                cy.wrap(item).uncheck()
    
                cy.wrap(item).should('not.be.checked')
    
                numOfBoxes++;
            })
        })
    })

    context("Add/Remove Elements", () => {
        it("Produce 5 delete buttons and press all 5 of them", () => {
            const elemNumber = 5;

            cy.visit("https://the-internet.herokuapp.com/add_remove_elements/")
            
            // Check that the list of buttons doesn't exist
            cy.get('#elements [class*=added-manually]').should('not.exist')

            // Click add element button 5 times
            cy.get("body:nth-child(2) div.row:nth-child(2) div.large-12.columns:nth-child(2) div.example:nth-child(3) > button:nth-child(1)")
            .then((DOMelem) => {
                for (let i = 0; i < elemNumber; i++){
                    DOMelem.click()
                }
            })
            
            // Get size of list
            cy.get('#elements [class*=added-manually]').should('have.length', elemNumber)

            // Check that each element is visible

            // #[id of parent DOM] [indentifying attribute of children]
            // * == must include the following text
            cy.get('#elements [class*=added-manually]').each((item, index, list) =>{
                cy.wrap(item).should('be.visible')
                cy.wrap(item).should('contain', 'Delete')
            })
            
            // Click each button
            cy.get('#elements [class*=added-manually]').each((item, index, list) =>{
                cy.wrap(item).click();
            })
            
            // Check that the list of buttons doesn't exist
            cy.get('#elements [class*=added-manually]').should('not.exist')

        })
    })

    context("Entry ad", () => {
        it("Check that modal window exists and close it", () => {
            cy.visit("https://the-internet.herokuapp.com/entry_ad")

            cy.get("body:nth-child(2) div.row:nth-child(2) div.large-12.columns:nth-child(2) div:nth-child(2) > div.modal")
            .should('exist')
            .contains("Close")
            .click()
        })
    })

    // Presentation 2

    context("Drag and drop", () =>{
        it("Drag box A over to box B to switch them around", () => {
            cy.visit("https://the-internet.herokuapp.com/drag_and_drop")

            // Check that the element starting positions are in the order: A > B
            cy.get('#columns [class*=column]').eq(0).then((elem) => {
                cy.wrap(elem).should("contain", "A")
            })
            cy.get('#columns [class*=column]').eq(1).then((elem) => {
                cy.wrap(elem).should("contain", "B")
            })

            // Checking draggable attribute (unnecessary)
            cy.get('#column-a')
            .should("have.attr", "draggable").then((elem) =>{
                cy.wrap(elem).should('eq', 'true')
            })
            
            // Another way to check attribute (unnecessary)
            cy.get('#column-a').should('attr', 'draggable', 'true')

            // This class holds the data being dragged during a drag and drop.
            // It can hold several data items of several types
            //
            // Transfer commands
            const dataTransfer = new DataTransfer();
            cy.get('#column-a')
            .trigger('dragstart', { dataTransfer })
            
            cy.get('#column-b')
            .trigger('drop', { dataTransfer } )

            cy.get('#column-a')
            .trigger('dragend', { dataTransfer })


            // Check the new order of elements
            cy.get('#columns [class*=column]').eq(0).then((elem) => {
                cy.wrap(elem).should("contain", "B")
            })
            cy.get('#columns [class*=column]').eq(1).then((elem) => {
                cy.wrap(elem).should("contain", "A")
            })
        })
    })

    context("Key Presses test", () => {
        function getKey(inkey){
            switch(inkey){
                case ".":
                    return "PERIOD"
                case " ":
                    return "SPACE"
                case ",":
                    return "COMMA"
                case "'":
                    return "BACK_QUOTE"
                case "/":
                    return "SLASH"
                case "[":
                    return "OPEN_BRACKET"
                case "]":
                    return "CLOSE_BRACKET"
                default:
                    return inkey.toUpperCase();
                    
            }
        }
        it("Enter several keys", () => {
            /*
                1. Ensure text box is working by typing into it and reading
                2. Ensure that key stroke detection is working by typing into text box and reading the key stroke response
                3. Ensure key stroke detection is working outside of text box by focusing off the text box, typing and checking th key stroke response
            */
            cy.visit("https://the-internet.herokuapp.com/key_presses")

            let testText = "abcdefghijklmnopqrstuvwxyz.,/][";

            // Testing test box
            cy.get("#target").then((textbox) =>{
                cy.wrap(textbox).focus();
                // Enter all chars in testText
                for (var i = 0 ; i<testText.length; i++){
                    cy.wrap(textbox).type(testText[i])
                    // Check the character typed appears in the type recognition string
                    cy.get("#result").should("contain", "You entered: " + getKey(testText[i]));
                    // Check that the entered text appears in the textbox
                    cy.wrap(textbox).invoke('val').should("eq", testText.slice(0, i+1))
                }
                // Test backspace
                cy.wrap(textbox).type('{backspace}')
                cy.wrap(textbox).invoke('val').should("eq", testText.slice(0, testText.length-1))

                // Release text box
                cy.wrap(textbox).blur();
            })

            // Testing typing outside of textbox
            cy.get("body").then((pagebody) =>{
                for (var i = 0 ; i<testText.length; i++){
                    cy.wrap(pagebody).type(testText[i])
                    cy.get("#result").should("contain", "You entered: " + getKey(testText[i]));
                }
            })
        })
    })

    context("javascript alerts", () => {
        it("Handle javascript alert", () => {
            cy.visit("https://the-internet.herokuapp.com/javascript_alerts")

            let JSAlert = {
                "appeared": false,
                "clicked": false
            }

            // check the window alert
            /*
                Events: https://docs.cypress.io/api/events/catalog-of-events#App-Events
                ---
                window:alert yeilds a string. It fires when the window.alert()
                function is called in javascript code.

                .on is a jQuery method that binds an eventhandler to the element
            */

            cy.on('window:alert', (str) => {
                JSAlert.appeared = true;
                cy.wrap(str).should("contain", 'I am a JS Alert')
                //expect(str).to.equal('I am a JS Alert');
            })
            
            // Returning false cancels confirmation. Returning true accepts the alert
            cy.on('window:confirm', () => {
                JSAlert.clicked = true;
                return true;
            });


            // ---


            // Check that success message isn't present
            cy.get("#result").should("not.contain", "You successfully clicked an alert");

            // grab js alert button and click it
            cy.get("div.row:nth-child(2) div.large-12.columns:nth-child(2) div.example:nth-child(2) ul:nth-child(3) li:nth-child(1) > button:nth-child(1)")
            .click()
            
            cy.log("appeared " + JSAlert.appeared)
            cy.log("clicked " + JSAlert.clicked)

            cy.get("#result").should("contain", "You successfully clicked an alert")

            /*
            // If it's not here then the alert either didn't appear or wasn't clicked on.
            if (!JSAlert.appeared){
                //throw new Error("Button 'Click for JS Alert did not produce a JS alert")
            }
            else if (!JSAlert.clicked){
                //throw new Error("OK button in JS alert did not dismiss alert")
            }
            */
        })

        it("Confirm Javascript alert", () =>{
            cy.visit("https://the-internet.herokuapp.com/javascript_alerts")

            cy.get('div.row:nth-child(2) div.large-12.columns:nth-child(2) div.example:nth-child(2) ul:nth-child(3) li:nth-child(2) > button:nth-child(1)')
            .click()

            cy.on('window:confirm', (str) => {
                expect(str).to.equal(`I am a JS Confirm`)
            })

            cy.on('window:confirm', () => true);
            
            cy.get('#result').should("contain", 'You clicked: Ok')
        })

        it("Cancel Javascript alert", () =>{
            cy.visit("https://the-internet.herokuapp.com/javascript_alerts")

            cy.on('window:confirm', (str) => {
                expect(str).to.equal(`I am a JS Confirm`)
            })

            cy.get('div.row:nth-child(2) div.large-12.columns:nth-child(2) div.example:nth-child(2) ul:nth-child(3) li:nth-child(2) > button:nth-child(1)')
            .click()

            cy.on('window:confirm', () => false);
            
            cy.get('#result').should("contain", 'You clicked: Cancel')
        })
        
        it("Javascript text box", () => {
            cy.visit("https://the-internet.herokuapp.com/javascript_alerts")

            // An attempt to close the java alert box that appears over the cypress window
            // not working
            cy.on('window:confirm', () => true);

            cy.get("div.row:nth-child(2) div.large-12.columns:nth-child(2) div.example:nth-child(2) ul:nth-child(3) li:nth-child(3) > button:nth-child(1)")
            .click()
            

            // ---
            const testText = "jnvou9rreih39jsd"

            /*
                -- STUB --
                https://docs.cypress.io/api/commands/stub#Usage
                    - cy.stub overrides a function.
                    - Takes object and member function as args
                    - .returns() allows you to return a value to where it was called

                Grab window object. Call prompt function, return text
            */
            cy.window().then((windowObj) => {
                //cy.stub(windowObj, 'prompt').returns(testText)
                //cy.contains('Click for JS Prompt').click()

                cy.stub(windowObj, 'prompt').returns(testText)
            })

            cy.get('#result').contains("You entered: " + testText)

        })
    })

    context("infinite scroll", () => {
        it("Scroll down produces more text", () => {
            let scrolliter = 2;
            let scrollnum = 3;
            cy.visit("https://the-internet.herokuapp.com/infinite_scroll").then(() =>{
                for (let i=0; i<scrollnum; i++){
                    cy.intercept({
                        method: 'GET',
                        url: '/infinite_scroll/' + scrolliter,
                    }).as('httpreq' + scrolliter)
        
                    cy.window().scrollTo('bottom')

                    cy.wait('@httpreq' + scrolliter).then((interception) => {
                        // Check statis response 200
                        cy.wrap(interception.response.statusCode).should('eq', 200)

                        cy.wrap(interception.response.body).should('have.lengthOf.greaterThan', 200)
                        .and('contain', '<br />')
                        .and('contain', "<a href='" + '/infinite_scroll/')

                        // Assert that the response body has text
                        assert.isNotNull(interception.response.body, 'API call has data')
                    })
                    
                    scrolliter++
                }
            })
        })
    })
  
    context("File Downloader", () => {
        
        it('Check that every download link', function() {
            cy.visit("https://the-internet.herokuapp.com/download")
            /*
                Clicking on a download link Cypress waits for a load event to be triggered for 5 seconds
                Because no redirection is actually happening a load event is never triggered and it times out.

                Could get out of the problem with a cypress-downloadfile package
            */

            /*
            Get list of download links
            check it has a href
            make request
            check response code
            check header for filename and compare against list item text
            */
            cy.get('body:nth-child(2) div.row:nth-child(2) div.large-12.columns:nth-child(2) > div.example > a')
            .each((item, index, list) =>{
                cy.wrap(item).should('have.attr', 'href').then((inhref) => {

                    cy.request({
                        url: inhref,
                    }).then((response) => {

                        expect(response.status).to.equal(200);
                        const fullval = response.headers['content-disposition']
                        const slicedFileName = fullval.slice(22, fullval.length-1)
                        
                        cy.wrap(item.text()).should('eq', slicedFileName)
                    })

                })

            })
          })
    })

    context("image upload", () =>{
        /*
            attach image somehow
            press upload
            intercept POST request
            check status code
        */
        it("testing image upload", () =>{
            cy.fixture('testuploadimg.png').then(img => {
                cy.get()
            })
        })
    })

})