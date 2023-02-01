import Head from 'next/head'
import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from "styled-components"
import Image from "next/image"
import { TextField, Checkbox, FormGroup, FormControlLabel } from '@mui/material'

const Container = styled.div`
    width: 70%;
    margin: auto;
    position: relative;
    & div.options_header {
        width: 100%;
        & div.options {
            width: 100%;
            margin-bottom 10px;
            display: flex;
            justify-content: space-between;
            padding: 0px 10px;
            & div.search {
                display: flex;
                gap: 10px;
                border: 1px solid rgba(0,0,0);
                border-radius: 5px;
                padding: 5px;
                position: relative;
                align-items: center;
                width: fit-content;
                & > input {
                    outline: none;
                    background: transparent;
                    border: none;
                    font-size: 18px;
                    height: 40px;
                    padding: 0px 0px 0px 50px;
                }
                & > img {
                    position: absolute;
                    z-index: -1;
                }
                &:hover, &:focus-within {
                    border: 1px solid rgba(130,0,130);
                }
            }
            & button.addEmployee {
                background-color: rgba(0,150,255);
                border-radius: 10px;
                gap: 20px;
                padding: 0px 10px;
                color: white;
                & > img {
                    filter: invert(1);
                }
                &:hover {
                    background-color: rgba(0,100,255);
                }
            }
        }
        & form {
            display: flex;
            overflow: hidden;
            max-height: 0vh;
            padding: 0;
            gap: 10px;
            &.active {
                padding: 25px 0;
                max-height: 50vh;
            }
            & div.myButtons {
                display: flex;
                gap: 5px;
                position: relative;
                & button:hover > img {
                    filter: brightness(80%);
                }
                & .add {
                    position: absolute;
                    width: 100%;
                    text-align: center;
                    top: -40%;
                    border-radius: 5px;
                    color: white;
                    background-color: rgba(0,150,255);
                    &:after {
                        content: 'ADD';
                    }
                }
                & .update {
                    position: absolute;
                    width: 100%;
                    text-align: center;
                    top: -40%;
                    border-radius: 5px;
                    color: white;
                    background-color: rgba(0,150,0);
                    &:after {
                        content: 'UPDATE';
                    }
                }
            }
        }
        & table.header {
            width: 100%;
            border-collapse: collapse;
            border-right: 8px solid rgb(75,0,75);
            & > thead {
                & > tr {
                    & > th {
                        // Comments at "& .paid" about the width.
                        width: 15%;
                        font-size: 20px;
                        font-weight: 500;
                        background-color: rgb(75,0,75);
                        color: white;
                        padding: 20px 0;
                        &:last-child {
                        }
                    }
                }
            }
        }
    }
    //Seperated the header and the body so you can scroll the body.
    & div.table_content {
        width: 100%;
        height: 55vh;
        overflow: scroll;
        & table.body {
            width: 100%;
            border-collapse: collapse;
            & > tbody {
                & > tr {
                    &:nth-child(even) {
                        background-color: rgba(0,0,0,0.15);
                    }
                    &.checked {
                        filter: opacity(0.3);
                    }
                    &:hover {
                        background-color: rgba(90,0,90,0.15);
                    }
                    & > td {
                        padding: 5px 0;
                        text-align: center;
                        text-transform: capitalize;
                        // Comments at "& .paid" about the width.
                        width: 15%;
                        &.artist {
                            font-weight: 500;
                        }
                        & .actions {
                            display: flex;
                            justify-content: center;
                            gap: 20px;
                            & > button {
                                &:hover > img {
                                    transform: translate(0, -2px);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // The 'paid' column has very little content, so it's smaller. Width's are [15,15,15,15,15,10,15] = 100%.
    & .paid {
        width: 10% !important;
    }
    & div.fade {
        position: absolute;
        bottom: 0%;
        width: 100%;
        height: 80px;
        background: linear-gradient(to top, rgba(255,255,255,1), transparent);
    }
`

export default function Home() {
	// Used for correct rerendering. Changing 'artists' directly does not update the page.
    const [artists, setArtists] = useState([])
	// GET: Gets all of the data, then sets the state variable to it.
	function getRecords() {
		axios.get('/api/database')
			.then(res => {
				setArtists(res.data.sort((a, b) => (b.rate * b.streams) - (a.rate * a.streams)))
		})
	}
	// Gets the records and sorts them on page load.
	useEffect(() => {getRecords()}, [])
    // Used as filter variable for table.
    const [search, setSearch] = useState('')
    // Expands hidden form. Is toggled by edit button, add artist button, confirm, cancel.
    const [formToggler, setFormToggler] = useState(false)
    // Form elements are stored here. Updated directly from controlled inputs. This is what's passed to the database.
    const [form, setForm] = useState({
        id: '',
        artist: '',
        rate: '',
        streams: '',
        paid: false
    })
    // Getting the months since launch on April, 2006.
    const today = new Date()
    const launch = new Date(2006, 3, 1) // getMonth() is 0 based index, so 3 -> April instead of March.
    const monthsSinceLaunch = today.getFullYear() * 12 + today.getMonth() - (launch.getFullYear() * 12 + launch.getMonth())
    // Toggles open/closed state of form, and resets the form's state properties. Not used by prepareUpdate().
    function toggleForm (bool = false) {
        setForm({
            id: '',
            artist: '',
            rate: '',
            streams: '',
            paid: false
        })
        setFormToggler(bool)
    }
    // POST/PUT: Add's record to DB, ON DUPLICATE KEY UPDATE.
    function addRecord(e) {
		e.preventDefault()
        axios.post('/api/database', {...form})
            .then(() => {
				toggleForm()
				getRecords()
			})
    }
    // PATCH: Toggles paid status by id prop, which then affects row <tr> styling through dynamic class. Toggles it client side, if successful.
    function togglePaid (id) {
        axios.patch('/api/database', {id})
             .then(() => getRecords())
    }
    // DELETE: Deletes a record by id prop, removes it client side, if successful.
    function deleteRecord (id) {
        axios.delete(`/api/database?delId=${id}`)
             .then(() => getRecords())
    }
    // Fills form's values with those of the artist. Form ID contains a value only through this method. confirmCurrent() depends on it.
    function prepareUpdate(artistObj) {
        setFormToggler(true)
        setForm({
            ...artistObj, 
            artist: artistObj.artist.charAt(0).toUpperCase() + artistObj.artist.slice(1) // Capitalizes the first letter.
        })
    }
    // Headers for the table.
    const headers = ['Artist', 'Rate', 'Streams', 'Total Payout', 'AVG.Monthly', 'Paid', 'Actions']
    return (
        <Container>
			<Head>
				<title>Payouts</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
            <div className='options_header'>
                <div className='options'>
                    <div className='search'>
                        <Image src='/search_icon.png' height={35} width={35} alt='Search Icon' />
                        <input onChange={(e) => setSearch(e.target.value.toLowerCase())} placeholder='Search...' />
                    </div>
                    <button className='addEmployee' onClick={() => toggleForm(true)}>
                        Add Artist
                        <Image src='/add_artist_icon.png' height={35} width={35} alt='Add Artist Button' />
                    </button>
                </div>
                <form className={formToggler ? 'active' : ''} onSubmit={addRecord}>
                    <TextField 
                        variant='outlined' 
                        label='Artist' 
                        fullWidth 
                        onChange={(e) => setForm({...form, artist: e.target.value})}
                        value={form.artist}
                        type='text'
                        required
                        color='primary' 
                    />
                    <TextField 
                        variant='outlined' 
                        label='Rate' 
                        fullWidth 
                        onChange={(e) => setForm({...form, rate: e.target.value})}
                        value={form.rate}
                        type='number'
                        required
                        color='primary'
                    />
                    <TextField 
                        variant='outlined' 
                        label='Streams' 
                        fullWidth 
                        onChange={(e) => setForm({...form, streams: e.target.value})}
                        value={form.streams}
                        type='number'
                        required
                        color='primary' 
                    />
                    <FormGroup style={{margin: 'auto'}}>
                        <FormControlLabel checked={form.paid ? true : false} control={<Checkbox onChange={() => setForm({...form, paid: !form.paid})} />} label='Paid' />
                    </FormGroup>
                    <div className='myButtons'>
                        <div className={form.id ? 'update' : 'add'} />
                        <button type='submit'><Image src='/confirm_icon.png' height={45} width={45} alt='Confirm Icon' /></button>
                        <button type='reset' onClick={() => toggleForm()}><Image src='/cancel_icon.png' height={45} width={45} alt='Cancel Icon' /></button>
                    </div>
                </form>
                <table className='header'>
                    <thead>
                        <tr>
                            {
                                headers.map((header, i) => <th key={i} className={header.toLowerCase()}>{header}</th>)
                            }
                        </tr>
                    </thead>
                </table>
            </div>
            <div className='table_content'>
                <table className='body'>
                    <tbody>
                        {
                            artists.map(artistObj => {
								// Can use includes(), but this makes the search more strict.
                                if(artistObj.artist.toLowerCase().indexOf(search)) return false
                                const { id, artist, rate, streams, paid } = artistObj
                                const total = rate * streams
                                const averageMonthly = (total / monthsSinceLaunch)
                                return (
                                    <tr key={id} className={paid ? 'checked' : ''}>
                                        <td className='artist'>{artist}</td>
                                        <td>{rate}</td>
                                        <td>{streams.toLocaleString()}</td>
                                        <td>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>{averageMonthly.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className='paid'><Checkbox checked={paid ? true : false} onChange={() => togglePaid(id)} /></td>
                                        <td>
                                            <div className='actions'>
                                                <button onClick={() => prepareUpdate(artistObj)}><Image src='/edit_icon.png' height={35} width={35} alt='Edit Icon' /></button>
                                                <button onClick={() => deleteRecord(id)}><Image src='/delete_icon.png' height={35} width={35} alt='Delete Icon' /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className='fade' />
        </Container>
    )
}

