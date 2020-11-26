import e from "express"
import * as path from "path"
import * as todo from "./todo"
import bodyParser from "body-parser"
import { config } from "./config"

const STATIC_DIR = path.join(__dirname, '..', 'static')
const DIST_DIR = path.join(__dirname, '..', 'dist')
const TOAST_DIR = path.join(__dirname, '..', 'node_modules', 
    'jquery-toast-plugin', 'dist')

const app = e()

app.use('/', e.static(STATIC_DIR))
app.use('/dist', e.static(DIST_DIR))
app.use('/toast', e.static(TOAST_DIR))

app.use(bodyParser.urlencoded({extended: true}))

/**
 * Dynamic routes
 */
app.get("/list", (req, res) => {
    res.json(todo.model)
})

app.post("/add", (req, res) => {
    const hasDescription = "description" in req.body
    const hasTags = "tags" in req.body

    if (hasDescription && hasTags) {
        todo.model.push(req.body)
        res.json({status: "ok"})
    } else {
        res.json({status: "failed"})
    }
})


/**
 * OS signal handling
 * Automatic saving of the data model to disk
 * when the server shuts down
 */
process.once('exit', (code) => {
    console.log(`Server exiting with code ${code}...`)
    todo.saveFile()
    console.log(`Server exited`)
})

function exitHandler() {
    process.exit()
}

process.once("SIGINT", exitHandler)
process.once("SIGUSR2", exitHandler)


app.listen(config["server-port"], () => {
    todo.loadFile()
    console.log("ToDo! server Listening on port " + config["server-port"])
})