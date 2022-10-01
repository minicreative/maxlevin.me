
const CALENDAR_ID = "ipf64s1a1d693tq5h6ceu37dns@group.calendar.google.com"
const PROTECTED_API_KEY = "AIzaSyCxWn3YgVxbXSzquwQr8Y0JccImuNvNNt4"

import { format } from 'https://esm.run/date-fns';
let linkRegex = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)

// Setup calendar
$(document).ready(() => {
    $("#calendarList").each(function() {

        let div = $(this)
        let previewList = div.hasClass("preview")
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

                // Handle filters
                if (previewList) {
                    if (end < now) continue
                    if (upcomingItems.length >= 10) break
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

                // Push element into correct array
                if (start > now) upcomingItems.push(li)
                else pastItems.push(li)
            }

            // Reverse past items
            pastItems.reverse()

            // Setup HTML
            let upcomingList = $("<ul></ul>")
            for (let i of upcomingItems) upcomingList.append(i)
            let pastList = $("<ul></ul>")
            for (let i of pastItems) pastList.append(i)

            if (div.hasClass("preview")) {
                div.html(upcomingList)
            } else {
                let html = $("<div></div>")
                html.append("<h2>Upcoming Events</h2>")
                html.append(upcomingList)
                html.append("<h2>Past Events</h2>")
                html.append(pastList)
                div.html(html)
            }

            $("li .main").on('click', function() {
                $(this).parent().toggleClass("expanded")
            })
            
        })
    })
})