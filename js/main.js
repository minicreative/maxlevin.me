
const CALENDAR_ID = "ipf64s1a1d693tq5h6ceu37dns@group.calendar.google.com"
const PROTECTED_API_KEY = "AIzaSyCxWn3YgVxbXSzquwQr8Y0JccImuNvNNt4"

import { format } from 'https://esm.run/date-fns';
let linkRegex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)

// Setup calendar
$(document).ready(() => {
    $("#calendarList").each(function() {

        let div = $(this)
        let isPreview = div.hasClass("preview")
        let onlyPast = div.hasClass("onlyPast")
        let onlyUpcoming = div.hasClass("onlyUpcoming")
        let upcomingItems = []
        let pastItems = []

        $.get(`https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${PROTECTED_API_KEY}&singleEvents=true&orderBy=startTime`, (data) => {
            
            let now = Date.now()
            for (let item of data.items) {

                // Parse date
                let start, end
                if (item.start.dateTime) {
                    start = Date.parse(item.start.dateTime)
                    end = Date.parse(item.end.dateTime)
                } else if (item.start.date) {
                    start = Date.parse(item.start.date)
                    end = Date.parse(item.end.date)
                } else {
                    continue
                }

                // Format date
                let timeString = format(start, 'EEE MMMM d, yyyy @ haaaa')
                // if (end - start > (60*60*24)) timeString += format(end, ' - ha')
                // else timeString += format(end, ' - MMM d, yyyy @ ha')

                // Details
                let details = "<div class='details'>"
                if (item.location) {
                    let location = item.location.replaceAll(/(?:\r\n|\r|\n)/g, '<br>')
                    let mapLink = `<a href='https://maps.google.com/?q=${item.location.replaceAll(/(?:\r\n|\r|\n)/g, '')}'>view map</a>`
                    details += `<p>${location}<br />${mapLink}</p>`
                }
                if (item.description) {
                    let description = item.description
                    description = description.replaceAll(/(?:\r\n|\r|\n)/g, '<br>')
                    let links = description.match(linkRegex)
                    for (let i of links) description = description.replace(i, `<a href='${i}'>${i}</a>`)
                    details += `<p>${description}</p>`
                }
                details += "</div>"

                // Setup element
                let li = $(`<li>
                    <div class='main'>
                        ${timeString}<br />
                        <span class='title'>${item.summary}</span>
                    </div>
                    ${details}
                </li>`)
                if (item.description) li.addClass("hasDetails")

                // Push element into correct array
                if (start > now) {
                    li.addClass("upcoming")
                    upcomingItems.push(li)
                }
                else {
                    li.addClass("past")
                    pastItems.push(li)
                }
            }

            // Reverse past items
            pastItems.reverse()

            // Trim arrays if preview
            if (isPreview) {
                pastItems = pastItems.slice(0, 5)
                upcomingItems = upcomingItems.slice(0, 5)
            }

            // Setup and insert HTML
            let upcomingList = $("<ul></ul>")
            for (let i of upcomingItems) upcomingList.append(i)
            let pastList = $("<ul></ul>")
            for (let i of pastItems) pastList.append(i)

            let html = $("<div></div>")
            if (!onlyPast) {
                if (isPreview) html.append("<h2>Upcoming</h2>")
                html.append(upcomingList)
                if (isPreview) html.append("<p><a href='/upcoming-events'>View all upcoming events</a></p>")
            }
            if (!onlyUpcoming) {
                if (isPreview) html.append("<h2>Past</h2>")
                html.append("<p>Events in bold contain audio and text materials from the event.</p>")
                html.append(pastList)
                if (isPreview) html.append("<p><a href='/past-events'>View all past events</a></p>")
            }
            div.html(html)

            // Setup click listeners
            $("li .main").on('click', function() {
                $(this).parent().toggleClass("expanded")
            })
            
        })
    })
})