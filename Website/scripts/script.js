var postcodes = [];

window.onload = async function () 
{
    await pageLoad();
}


async function pageLoad()
{
    // Populating dropdowns
    await fetch("scripts/getPostcodes.php")
    .then(response => response.json())
    .then(data =>
    {
        data.forEach(x => 
        {
            postcodes.push({ postcodeID: x.postcodeID, postcode: x.postcode });
        });
    })
    .then(() => 
    {
        const dropdowns =
        [
            ddPC1 = document.getElementById('pc1List'),
            ddPC2 = document.getElementById('pc2List'),
            ddEditPC = document.getElementById('editPCList'),
            ddRemovePC = document.getElementById('removePCList')
        ];

        postcodes.forEach(pc =>
        {
            dropdowns.forEach(dd => 
            {
                var opt = document.createElement('option');
                opt.value = pc.postcodeID;
                opt.innerHTML = pc.postcode;
                dd.appendChild(opt);
            })
        })
    })
    .catch(error =>
    {
        console.error('Error fetching data: ', error);
    });

    // Populating postcode facts
    await populatePC1(await getPostcodeData(postcodes[0].postcode));
    await populatePC2(await getPostcodeData(postcodes[0].postcode));

    // Populating distance calculated using first postcodes in each dropdown
    populateDistance();
}


// Postcode API call
async function getPostcodeData(postcode)
{
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    if (!response.ok)
    {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}


// Obtains selected postcode 1 data
async function onInput_pc1List(selectObject)
{
    const result = await getPostcodeData(selectObject[selectObject.selectedIndex].innerHTML);
    populatePC1(result);
    populateDistance();
}


// Populate Postcode 1 facts
function populatePC1(data)
{
    var ul = document.getElementById('pc1Info');
    ul.innerHTML = '';
    var keys = Object.keys(data.result);
    for (let i = 0; i < keys.length; i++)
    {
        if(keys[i] != 'codes')
        {
            var li = document.createElement('li');
            li.innerHTML = `${keys[i]}: ${data.result[keys[i]]}`;
            ul.appendChild(li);
        }
    }
}


// Obtains selected postcode 2 data
async function onInput_pc2List(selectObject)
{
    const result = await getPostcodeData(selectObject[selectObject.selectedIndex].innerHTML);
    populatePC2(result);
    populateDistance();
}


// Populate Postcode 2 facts
function populatePC2(data)
{
    var ul = document.getElementById('pc2Info');
    ul.innerHTML = '';
    var keys = Object.keys(data.result);
    for (let i = 0; i < keys.length; i++)
    {
        if(keys[i] != 'codes')
        {
            var li = document.createElement('li');
            li.innerHTML = `${keys[i]}: ${data.result[keys[i]]}`;
            ul.appendChild(li);
        }
    }
}


// Populate distance text
async function populateDistance()
{
    var pc1List = document.getElementById('pc1List');
    var pc2List = document.getElementById('pc2List');
    var response1 = await getPostcodeData(pc1List[pc1List.selectedIndex].innerHTML);
    var response2 = await getPostcodeData(pc2List[pc2List.selectedIndex].innerHTML);
    var distance = calcDistance(response1.result['latitude'], response2.result['latitude'], response1.result['longitude'], response2.result['longitude']);
    document.getElementById('miles').innerHTML = `${distance.toFixed(2)} Miles`;
}


// Function to calculate distance between two postcodes
function calcDistance(latitude1, latitude2, longitude1, longitude2)
{
    // Function to convert from degrees to radians
    function radians(x)
    {
        return x * Math.PI / 180;
    }
    
    // Convert latitudes and longitudes to radians
    const radLatitude1 = radians(latitude1);
    const radLatitude2 = radians(latitude2);
    const radLongitude1 = radians(longitude1);
    const radLongitude2 = radians(longitude2);

    // Variables
    const r = 6371000;  //Earth Radius (m)
    const deltaPhi = radLatitude2 - radLatitude1;
    const deltaLambda = radLongitude2 - radLongitude1;
    
    // Calculate a
    const a = (Math.sin(deltaPhi / 2) ** 2) + (Math.cos(radLatitude1) * Math.cos(radLatitude2) * (Math.sin(deltaLambda / 2) ** 2));
    
    // Calculate distance in m
    const d = r * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

    // Convert distance to miles
    const distance = d * 0.00062137;

    // Return distance in km
    return distance;
}


// Add postcode to database
async function onClickAddPostcode() 
{
    try
    {
        // Check postcode is in API
        await getPostcodeData(document.getElementById("inputAddPostcode").value);

        // PHP call to add postcode to database
        let toSend = {"request": document.getElementById("inputAddPostcode").value.toUpperCase()};
        await fetch("scripts/addPostcode.php",
        {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(toSend)
        })
        .then(() => 
        {
            document.getElementById("inputAddPostcode").value = '';
            document.getElementById("inputEditPostcode").value = '';
            location.reload();
        })
        .catch((error) => console.error(error));
    }
    // Catch error and show hidden **INVALID POSTCODE** message
    catch (error)
    {
        document.getElementById("addError").style.display = "block";
    }
}


// Edit postcode in database
async function onClickEditPostcode() 
{
    try
    {
        // Check postcode is in API
        await getPostcodeData(document.getElementById("inputEditPostcode").value);

        // PHP call to edit postcode in database
        let toSend = {"request": {postcodeID: document.getElementById("editPCList").value, postcode: document.getElementById("inputEditPostcode").value.toUpperCase()}};
        await fetch("scripts/editPostcode.php", 
        {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(toSend)
        })
        .then(() => 
        {
            document.getElementById("inputAddPostcode").value = '';
            document.getElementById("inputEditPostcode").value = '';
            location.reload();
        })
        .catch((error) => console.error(error));
        }
    // Catch error and show hidden **INVALID POSTCODE** message
    catch (error)
    {
        document.getElementById("editError").style.display = "block";
    }
}


// Remove postcode from database
async function onClickRemovePostcode() 
{
    // PHP call to remove postcode from database
    let toSend = {"request": document.getElementById("removePCList").value};
    await fetch("scripts/removePostcode.php",
    {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(toSend)
    })
    .then(() => 
    {
        document.getElementById("inputAddPostcode").value = '';
        document.getElementById("inputEditPostcode").value = '';
        location.reload();
    })
    .catch((error) => console.error(error));
}
