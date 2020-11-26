import * as fs from "fs"
import {config} from "./config"

export interface ToDo {
    'description': string,
    'tags': string[]
}

// in-memory model
export let model: ToDo[] = []

/**
 * Load data model from disk
 */
export function loadFile() {
    try {
        console.log("Loading model from the file system...")
        model = JSON.parse(fs.readFileSync(config["todo-file"]).toString())
        console.log("Model loaded")
    } catch(error) {
        console.error("Failed to load data model from filesystem")
        console.error((error as Error).stack)
    }
}

/**
 * Save data model to disk
 */
export function saveFile() {
    try {
        console.log("Saving model to the file system...")
        fs.writeFileSync(config["todo-file"], JSON.stringify(model))
        console.log("Finished saving data")
    } catch(error) {
        console.error("Failed to save data model to filesystem")
        console.error((error as Error).stack)
    }
    
}