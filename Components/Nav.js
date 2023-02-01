import styled from "styled-components"
import Image from "next/image"

const Nav = styled.div`
    width: 100vw;
    height: 100px;
    background-color: rgba(0,0,0,0.1);
    border-bottom: 1px solid rgba(0,0,0,0.2);
    margin-bottom: 5vh;
    display: flex;
    & > div {
        width: 70%;
        margin: auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        & > img {
            width: 200px;
            height: auto;
            object-fit: contain;
        }
        & > h1 {
            font-size: 80px;
            font-family: Raleway, sans-serif;
        }
    }
`

export default function () {
    return (
        <Nav>
            <div>
                <h1>Accounting Portal</h1>
                <Image src='/Rebel.png' height={1000} width={1000} alt='Rebel Logo' />
            </div>
        </Nav>
    )
}