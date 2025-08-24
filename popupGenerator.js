function generatePopupContent(feature) {
    // Define common parts of the popup
    var eventLocation = `${feature.properties.location_name}, ${feature.properties.full_address}`;
    var eventName = feature.properties.event_name;
    var eventDate = feature.properties.date;
    var eventLink = feature.properties.event_link;
    var eventPhoto = 'header_square.jpg';

    // Define the dynamic parts based on feature properties
    var footer = ''

    if (feature.properties.inperson_n_h === 'Both in-person and virtual') {
        footer = `<div class = "left-side"><div class="hybrid">Virtual Option Available</div></div><div class="right-side"><form action="${eventLink}" target="_blank">
                    <button class="learnMoreBtn">
                        Learn More...
                    </button>
                </form></div>`;
    } 
    else {
        footer = `<form action="${eventLink}" target="_blank">
                    <button class="learnMoreBtn">
                        Learn More...
                    </button>
                </form>`
    }

    if (feature.properties.event_photo != ''){
        eventPhoto = feature.properties.event_photo
    }

    // Build the popup content using a template literal
    return `
        <div class="wrapper">
            <div class="header">
                <div class="eventName">
                    ${eventName}<br>
                </div>
            </div>
            <div class="photo">
                <img src=${eventPhoto}>
            </div>
            <div class="table-layout">
                <table class="popup-tbl">
                    <tr>
                        <th>Event Date:</th>
                        <td>${eventDate}</td>
                    </tr>
                    <tr>
                        <th>Event Location:</th>
                        <td>${eventLocation}</td>
                    </tr>
                </table>
            </div>
            <div class="footer">
                ${footer}
            </div>
        </div>
    `;
}
