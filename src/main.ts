import { getRequestHeaders } from './auth';
import moment from 'moment';
import { File } from './models/file'

/**
 * @desc Find out if an HTMLElement has a star as lastchild
 * @param el - HTMLElement to inspect
 * @return boolean
 */
function hasStar(el: HTMLElement) {
    const contentOfLastChild = (el!.lastChild as HTMLElement).innerHTML;
    return contentOfLastChild === '★';
}

/**
 * @desc List files of a Google Drive
 * @param string previousPageToken - Token of the previous page, empty as default
 * @param string nextPageToken @optional - Token of the next page
 */
async function listDriveFile(): Promise<void> {
    const headers = await getRequestHeaders();

    const init = {
        method: 'GET',
        headers
    };

    fetch(`https://www.googleapis.com/drive/v3/files?
			pageSize=25
			&fields=
				files/name,
				files/id,
				files/thumbnailLink,
				files/modifiedTime,
				files/webViewLink
		`, init)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('list');
            list!.innerHTML = '';

            data.files.forEach((el: File) => {
                // Create a 'li' element for every file
                const li = document.createElement('li');
                const content = document.createElement('p');

                content.textContent = el.name;
                if (el.modifiedTime) content.textContent += ", modified " + moment(el.modifiedTime).fromNow();
                if (el.thumbnailLink) {
                    // Create an img element
                    const img = document.createElement('img');
                    img.setAttribute('src', el.thumbnailLink);

                    // Create the link to open the document
                    const link = document.createElement('a');
                    link.setAttribute('href', el.webViewLink);
                    link.setAttribute('target', '_blank'); // Open in a new tab
                    // Insert img element in the link
                    link.appendChild(img);

                    li.appendChild(link);
                }
                li.appendChild(content);

                // Create the checkbox input
                const input = document.createElement('input');
                input.setAttribute('id', el.id);
                input.setAttribute('type', 'checkbox');
                li.prepend(input);

                list!.appendChild(li);
            });

            // Save the selected elements
            let checks: string[] = [];
            $('input[type="checkbox"').on('click', () => {
                checks = [];
                $(':checked').each((i, el) => { checks.push(el.id); });
            });

            const star = document.getElementById('star');
            const unstar = document.getElementById('unstar');

            // Add a star to the selected elements
            star!.onclick = () => {
                checks.forEach(id => {
                    const starctn = document.createElement('p');
                    starctn.textContent = '★';

                    const parentElement = document.getElementById(id)!.parentElement;
                    if (!hasStar(parentElement!)) parentElement!.appendChild(starctn) // Prevent duplication of stars
                });
            }

            // Delete the star on the selected elements
            unstar!.onclick = () => {
                checks.forEach(el => {
                    const parentElement = document.getElementById(el)!.parentElement;
                    if (hasStar(parentElement!)) parentElement!.removeChild((parentElement!.lastChild as HTMLElement)); // Prevents removing the wrong element
                });
            }
        });
}

listDriveFile();
