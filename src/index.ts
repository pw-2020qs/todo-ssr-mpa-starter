import $ from "jquery"
import {ToDo} from "./todo"
import "jquery-toast-plugin"

const STORAGE_KEY = "toDoObjects"

async function populateNewest() {
    const $content = $("<ul>")
    const titles = formatToDos(await load())

    for (let i = titles.length - 1; i >= 0; i--) {
        $content.append($("<li>").text(titles[i]))
    }

    return $content
}

async function populateOldest() {
    const $content = $("<ul>")
    const titles = formatToDos(await load())

    for (let i = 0; i < titles.length; i++) {
        $content.append($("<li>").text(titles[i]))
    }

    return $content
}

function populateGroupedByTags() {
    // TODO: implement as a exercise
}

function populateAdd() {
    const $descLabel = $('<label for="description">').text("Description: ")
    const $descInput = $('<input name="description" required>').addClass("description")
    const $tagLabel = $('<label for="tags">').text("Tags: ")
    const $tagInput = $('<input name="tags" required>').addClass("tags")
    const $button = $('<button type="submit">').text("+")
    const $form = $('<form action="/add" method="post">')

    $form.on("submit", function (ev) {
        const description = $descInput.val()?.toString().trim() || ""
        const tags = $tagInput.val()?.toString().split(",")
            .map(s => s.trim()) || []

        if (description.length > 0 && tags.length > 0) {
            try {
                saveOne({
                    "description": description,
                    "tags": tags
                }).then(() => {
                    $.toast({text: "Todo item added successfully"})
                    $("#newest").trigger("click")
                })
                .catch((err) => {
                    $.toast({text: "Failed to save todo item remotely"})
                    console.log((err as Error).stack)
                })
                
            } catch(err) {
                $.toast({text: "Failed to save todo item remotely"})
                console.log((err as Error).stack)
            }
        } else {
            $.toast({text: "Failed to add a new todo item"})
        }

        $tagInput.val("")
        $descInput.val("")

        ev.preventDefault();
    });

    return $("<div>").append($form.append($descLabel).append($descInput)
        .append($tagLabel).append($tagInput).append($button))

}

function formatToDos(model: ToDo[]): string[] {
    return model.map((toDo: ToDo ) => toDo.description)
}

async function saveOne(todo: ToDo) {
    let response: any

    try {
        response = await $.post($("form").attr("action") || "", todo)
    } catch(err) {
        throw err
    }

    if ("status" in response && response.status != "ok") {
        throw "Failed to save todo item remotely"
    }
}

async function load(): Promise<ToDo[]> {
    let model: ToDo[] = []

    try {
        model = await $.getJSON("/list")
    } catch(error) {
        console.log((error as Error).stack)
        $.toast({text: "Failed to load items from the server"})
    }

    return model
}

function main() {
    $(".tabs a span").on("click", function () {
        $(".tabs a span").removeClass("active")
        $(this).addClass("active")
        $("main .content").empty()
        
        const addContent = function (result: JQuery<HTMLElement>) {
            $("main .content").append(result)
        }

        if ($(this).is("#newest")) {
            populateNewest().then(addContent)
        } 
        else if ($(this).is("#oldest")) {
            populateOldest().then(addContent)
        } 
        // else if ($(this).is("#tags")) {
        //     $content = populateGroupedByTags()
        // } 
        else if ($(this).is("#add")) {
            addContent(populateAdd())
        } 
        else {
            addContent($("<p>").append("Failed to load data"))
        }

        return false
    })

    $("#newest").trigger("click")
}

$(main)