let nav = 0;
let clicked = null;
let selectedDay = null; 
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : []; 

const calendar = document.querySelector('#calendar');
const eventsSummary = document.querySelector('#eventsSummary');
const eventsSummaryContainer = document.querySelector('#eventsSummaryContainer');
const newEventModal = document.querySelector('#newEventModal');
const deleteEventModal = document.querySelector('#deleteEventModal');
const backDrop = document.querySelector('#modalBackDrop');
const eventTitleInput = document.querySelector('#eventTitleInput');
const eventDescription = document.querySelector('#eventDescription'); 
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const urgentDescriptor = document.querySelector("#urgentDescriptor");
const importantDescriptor = document.querySelector("#importantDescriptor");
const normalDescriptor = document.querySelector("#normalDescriptor");

function load(){
    events.sort(function(event1, event2) {
        date1Elements = event1.date.split("/");
        date2Elements = event2.date.split("/");
        
        difYear = Number(date1Elements[2]) - Number(date2Elements[2]);
        difMonth = Number(date1Elements[1]) - Number(date2Elements[1]);
        difDay = Number(date1Elements[0]) - Number(date2Elements[0]); 
    
        if(difYear > 0){
            return 1;
        } else if (difYear < 0){
            return -1; 
        }
    
        if(difMonth > 0){
            return 1;  
        } else if (difMonth < 0){
            return -1;  
        }
    
        if(difDay > 0){
            return 1; 
        } else if (difDay < 0){
            return -1; 
        }
    
        return 0; 
    });
    localStorage.setItem('events', JSON.stringify(events));
    eventsSummaryContainer.innerHTML = "";
    events.forEach(e => {
        const eventSummary = document.createElement('label');
        if(e.description === ''){
            e.description = "N/A";
        }
        eventSummary.innerText = `(${e.date} ` + e.title + ": " + e.description; 
        eventSummary.classList.add('event');
        eventSummary.classList.add('eventSummary');
        eventSummary.classList.add(e.eventStatus);
        eventsSummaryContainer.appendChild(eventSummary);
    });

    const dt = new Date();  

    if (nav !== 0){
        dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]); 

    document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', {month: 'long'})} ${year}`; 

    calendar.innerHTML = '';

    for(let i = 1; i <= paddingDays + daysInMonth; i++){
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if(i > paddingDays){
            const dayOfMonthIndicator = document.createElement('div'); 
            dayOfMonthIndicator.innerText = i - paddingDays; 
            dayOfMonthIndicator.classList.add('dayOfMonthIndicator'); 
            daySquare.appendChild(dayOfMonthIndicator);

            let eventsForDay = [];
            events.forEach(e => {
                if(e.date === dayString){
                    eventsForDay.push(e);
                }
            });

            const eventsHolder = document.createElement('div');
            eventsHolder.classList.add('eventsHolder');
            daySquare.appendChild(eventsHolder);
            eventsForDay.forEach(e => {
            const event = document.createElement('label');
            event.innerText = e.title; 
            event.classList.add('event');
            eventsHolder.appendChild(event);

            const eventDescriptor = document.createElement('div');
            eventDescriptor.classList.add('eventDescriptor');
            eventDescriptor.innerText = e.description.length > 0 ? e.description : 'N/A'; 
            daySquare.appendChild(eventDescriptor);

            event.classList.add(e.eventStatus);

            event.addEventListener('mouseover', () => {
                eventDescriptor.style.display = 'block';
            });

            event.addEventListener('mouseout', () => {
                eventDescriptor.style.display = 'none';
            });
            });

            if(i - paddingDays === day && nav === 0){
                dayOfMonthIndicator.style.backgroundColor = "lightBlue";
            }

            daySquare.addEventListener('click', () => clicked = dayString);

            daySquare.addEventListener('click', () => {
                if(selectedDay){
                    selectedDay.classList.remove('selectedDay');
                    selectedDay = daySquare; 
                    selectedDay.classList.add('selectedDay');
                } else{
                    selectedDay = daySquare; 
                    selectedDay.classList.add('selectedDay');
                }
            });
        } else{
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

function openNewEventModal(){
    if(clicked){
        newEventModal.style.display = 'block';
        backDrop.style.display = 'block';
        normalDescriptor.checked = 'checked'; 
    }
}

function openDeleteEventModal(){
    const eventsForDay = events.filter(e => e.date === clicked);

    if(eventsForDay.length > 0){
        deleteEventModal.style.display = 'block';
        backDrop.style.display = 'block';

        eventsForDay.forEach(e => {
            const event = document.createElement('div');
            event.classList.add('deleteEventList');
            const deleteCheckBox = document.createElement('input');
            deleteCheckBox.type = 'checkbox';
            deleteCheckBox.id = e.title + e.description; 
            deleteCheckBox.classList.add('deleteCheckBox');

            const eventDes = document.createElement('label');
            eventDes.for = 'deleteCheckBox'; 
            eventDes.innerText = e.title; 
            eventDes.classList.add('event');
            event.appendChild(deleteCheckBox);
            event.appendChild(eventDes);
            deleteModalContainer.appendChild(event);
        });
    }
}

function closeModal(){
    eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none'; 
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';

    eventTitleInput.value = '';
    eventDescription.value = '';
    deleteModalContainer.innerHTML = '';
    clicked = null;
    load();  
}

function saveEvent(){
    if (eventTitleInput.value){
        eventTitleInput.classList.remove('error');
        let status = "normal";

        if(importantDescriptor.checked){
            status = 'importantEvent';
        } else if(urgentDescriptor.checked) {
            status = 'urgentEvent';
        }

        events.push({
            date: clicked,
            title: eventTitleInput.value,
            description: eventDescription.value,
            eventStatus: status,
        }); 

        localStorage.setItem('events', JSON.stringify(events)); 
        closeModal();

    } else{
        eventTitleInput.classList.add('error');
    }
}

function deleteEvents(){
    const eventsForDay = events.filter(e => {
        e.date === clicked;
    });

    if(eventsForDay){
        const deleteCheckBoxes = document.querySelectorAll('.deleteCheckBox');
        deleteCheckBoxes.forEach(c =>{
            if(c.checked){
                events = events.filter(e => e.date !== clicked && (e.title + e.description) !== c.id);
                localStorage.setItem('events', JSON.stringify(events));
            }
        closeModal();
        });
    }
}


function initButtons(){
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load(); 
    });
    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load(); 
    });

    const eventsButton = document.getElementById('eventsButton');
    eventsButton.addEventListener('click', () =>{
        if(eventsSummary.classList.contains('clicked')){
            eventsSummary.classList.remove('clicked');
            eventsSummary.style.display = 'none';
        } else{
            eventsSummary.classList.add('clicked');
            eventsSummary.style.display = 'block';
        }
    });

    document.getElementById('addButton').addEventListener('click', () => {
        openNewEventModal();
    });
    document.getElementById('cancelButton').addEventListener('click', () => {
        closeModal();
    });
    document.getElementById('saveButton').addEventListener('click', () => {
        saveEvent();
    });
    document.getElementById('removeButton').addEventListener('click', () => {
        openDeleteEventModal();
    });
    document.getElementById('closeButton').addEventListener('click', () => {
        closeModal();
    });
    document.getElementById('deleteButton').addEventListener('click', () => {
        deleteEvents();
    });
}

initButtons();
load(); 

/*events.sort(function(event1, event2) {
    date1Elements = event1.date.split("/");
    date2Elements = event2.date.split("/");
    
    difYear = Number(date1Elements[2]) - Number(date2Elements[2]);
    difMonth = Number(date1Elements[1]) - Number(date2Elements[1]);
    difDay = Number(date1Elements[0]) - Number(date2Elements[0]); 

    if(difYear > 0){
        return 1;
    } else if (difYear < 0){
        return -1; 
    }

    if(difMonth > 0){
        return 1;  
    } else if (difMonth < 0){
        return -1;  
    }

    if(difDay > 0){
        return 1; 
    } else if (difDay < 0){
        return -1; 
    }

    return 0; 
});*/


