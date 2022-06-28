import {styles} from "./styles"
import {Field} from "./Field"
import {Player} from "./Player"
import {selectRandomElement} from "./helper_functions" 

export class Game {
    constructor(){
        this.boardEl = document.getElementById("board")
        this.displayEl = document.getElementById("display")
        this.size = null
        this.selectedPlayers = []
        this.density = null
        this.fields = []
        this.currentPlayers = []
        this.remainingPlayers = []
        this.playerOn = null
        this.gameOn = false
        this.error = false
    }    

    getInput(){
        const sizeEl = document.getElementById("size-input")
        this.selectSize(sizeEl)
        sizeEl.addEventListener("input", () => this.selectSize(sizeEl))

        const playerEls = document.querySelectorAll(".player input[type='checkbox']")
        playerEls.forEach(playerEl => {
            const player = new Player(playerEl.name)
            this.selectPlayer(playerEl, player)
            playerEl.addEventListener("input", () => this.selectPlayer(playerEl, player))
            const isComputerEls = playerEl.parentNode.querySelectorAll("input[type='radio']")
            isComputerEls.forEach(isComputerEl => {
                isComputerEl.addEventListener("input", () => this.selectIsComputer(playerEl, player))
            })
        })

        const checkedDensityEl = document.querySelector("#density input[name='density']:checked")
        this.selectDensity(checkedDensityEl)
        const densityEls = document.querySelectorAll("#density input[name='density']")
        densityEls.forEach(densityEl => {
            densityEl.addEventListener("input", () => this.selectDensity(densityEl))
        })

        const startButton = document.getElementById("start")
        startButton.addEventListener("click", () => {
            this.createBoard()
            this.startGame()
        })
    }

    selectSize(domEl){
        this.size = parseInt(domEl.value)
        const sizeDisplay = document.getElementById("size-display")
        sizeDisplay.textContent = this.size
    }

    selectPlayer(playerEl, player){
        if(playerEl.checked){
            this.selectIsComputer(playerEl, player)
            this.selectedPlayers.push(player)
        } else {
            this.selectedPlayers = this.selectedPlayers.filter(oldPlayer => oldPlayer.color !== playerEl.name)
        }
        console.log(this.selectedPlayers)
    }
    
    selectIsComputer(playerEl, player){
        const checkedIsComputerEl = playerEl.parentNode.querySelector("input[type='radio']:checked")
        player.isComputer = checkedIsComputerEl.value === "yes" ? true : false
    }

    selectDensity(domEl){
        this.density = domEl.value
    }
    
    displayError(message){
        const errorMessageEl = document.getElementById("error-message")
        errorMessageEl.textContent = message
        errorMessageEl.style.display = "block"
        this.error = true
    }

    createBoard(){
        const errorMessageEl = document.getElementById("error-message")
        let message
        if(this.selectedPlayers.length <= 1){
            message = "You need to select at least two players."
            this.displayError(message)
            return
        } else if((this.size === 5 && this.selectedPlayers.length >= 5 && (this.density === "dense" || this.density === "medium"))
        || (this.size === 4
            && ((this.selectedPlayers.length >= 3 && (this.density === "dense" || this.density === "medium"))
            || this.selectedPlayers.length === 6))){
            message = "The selected values are not valid. Try selecting less players, a smaller field, or less density."
            this.displayError(message)
            return
        } else {
            errorMessageEl.style.display = "none"          
            this.error = false
        }
        
        this.fields = []
        this.selectedPlayers.forEach(player => player.fields = [])
        
        this.boardEl.remove()
        const boardContainer = document.getElementById("board-container")
        const board = document.createElement("div")
        board.id = "board"
        board.style.gridTemplateColumns = `repeat(${this.size}, 5vw)`
        board.style.gridTemplateRows = `repeat(${this.size}, 5vw)`
        boardContainer.appendChild(board)
        this.boardEl = board
        
        let k = 0
        for (let i = 1; i <= this.size; i++){
            for (let j = 1; j <= this.size; j++){
                const col = i
                const row = j
                const id = k
                k++
                
                const field = new Field(id, row, col)
                const fieldEl = document.createElement("div")
                fieldEl.className = `field row${row} col${col}`
                fieldEl.id = "field" + id
                fieldEl.style.gridArea = `${row} / ${col} / span 1 / span 1`
                this.boardEl.appendChild(fieldEl)
                
                fieldEl.addEventListener("click", () => {
                    field.selectField()
                })
                
                field.fieldEl = fieldEl
                field.game = this
                this.fields.push(field)
            }
        }
        this.fields.forEach(field => field.getNeighbors())
        this.addPlayers()
        this.createDisplay()
        
        console.log(this)
    }

    addPlayers(){
        const size = this.size
        const players = this.selectedPlayers
        const density = this.density
        
        players.forEach(player => {
            if(size <= 7 && density === "sparse"){
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 1)
                this.assignPlayerToField(player, 1)
            } else if((size <= 7 && density === "medium")
                    || (size > 7 && density === "sparse")){
                this.assignPlayerToField(player, 3)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 1)
                this.assignPlayerToField(player, 1)
            } else if((size <= 7 && density === "dense")
            || (size > 7 && density === "medium")){
                this.assignPlayerToField(player, 3)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 1)
                this.assignPlayerToField(player, 1)
            } else if(size > 7 && density === "dense"){
                this.assignPlayerToField(player, 3)
                this.assignPlayerToField(player, 3)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 2)
                this.assignPlayerToField(player, 1)
                this.assignPlayerToField(player, 1)
                this.assignPlayerToField(player, 1)
            }
        })
    } 

    createDisplay(){
        this.displayEl.remove()
        const displayContainer = document.getElementById("display-container")
        const displayEl = document.getElementById("display")
        displayEl.id = "display"
        this.selectedPlayers.forEach(player => {
            const playerDisplayEl = document.createElement("div")
            playerDisplayEl.className = "display-player"

            playerDisplayEl.appendChild()
            playerDisplayEl.appendChild()
            playerDisplayEl.appendChild()
            playerDisplayEl.style.backgroundColor = styles.backgroundColor[player.color]
            playerDisplayEl.style.color = styles.color[player.color]
        })
        displayContainer.appendChild(displayEl)
    }

    assignPlayerToField(player, value){
        let index, field
        do {
            index = Math.floor(this.fields.length * Math.random())
            field = this.fields[index]
        } while(field.player || field.neighbors.length - value < 1)
        field.setField(player, value)
    }  

    startGame(){
        if(!this.error){
            this.currentPlayers = this.selectedPlayers
            this.remainingPlayers = this.currentPlayers
            this.playerOn = selectRandomElement(this.remainingPlayers)
            this.gameOn = true
            this.setIsOn()
            console.log("A new game has started")
        }
    }

    setIsOn(){
        this.playerOn.isOn = true
        console.log(`It's ${this.playerOn.color}'s turn.`)
        if(this.playerOn.isComputer){
            this.computerMoves()
        }    
    }    

    checkRemainingPlayers(player){
        if(player.fields.length === 0){
            this.remainingPlayers = this.remainingPlayers.filter(playerRemaining => playerRemaining.color !== player.color)
            if(this.remainingPlayers.length === 1){
                this.endGame()
            }    
        }    
    }    

    getNextPlayer(){
        if(this.gameOn){
            const currentIndex = this.remainingPlayers.indexOf(this.playerOn)
            const nextIndex = (currentIndex + 1) % this.remainingPlayers.length
            this.playerOn = this.remainingPlayers[nextIndex]
            this.setIsOn()
        }    
    }    

    endGame(){
        console.log(this.remainingPlayers[0].color + " has won!")
        this.playerOn = null
        this.gameOn = false
    }    

    computerMoves(){
        const selectedField = selectRandomElement(this.playerOn.fields)
        selectedField.selectField()
    }    
}