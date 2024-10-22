import { useState } from 'react';
import './modal.css'
import { TrackData } from './EditWindow';

export interface TrackForm {
    name: string;
    description: string;
    author: number | null
    visibility: string;
    image: Blob | null;
    trackdata: TrackData | null;
}

function SaveForm({ isOpen, closeModal, handleSubmit, errorMsg }) {
    if (!isOpen) return null;

    const [formData, setFormData] = useState<TrackForm>({
        name: '',
        description: '',
        author: null,
        visibility: 'private',
        image: null,
        trackdata: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return ( 
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={closeModal}>
                    &times; {/* Close button */}
                </button>
                <h2>Save Form</h2>
                <form onSubmit={(e) => handleSubmit(e, formData)}>
                    <div>
                        <label htmlFor="tracknameInput">Track Name: </label>
                        <input id="tracknameInput" name="name" onChange={handleChange}></input>
                    </div>
                    <div>
                        <label htmlFor="descriptionInput">Track Description: </label>
                        <input id="descriptionInput" name="description" onChange={handleChange}></input>
                    </div>
                    <div>
                        <label htmlFor="visibilityInput">Track Visibility: </label>
                        <select id="visibilityInput" name="visibility" onChange={handleChange} value={formData.visibility}>
                            <option value="private">Private</option>
                            <option value="unlisted">Unlisted</option>
                            <option value="public">Public</option>
                        </select>
                    </div>
                    <input type="submit" value="Submit" />
                </form>
                <div>{errorMsg}</div>
            </div>
        </div>
    );
}

export default SaveForm;