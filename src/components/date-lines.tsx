import { useEffect } from "react"

export const DateLines = ({x}) => {
    useEffect(() => {
        console.log('here')
        document.addEventListener('scroll', () => {
            console.log('event2');
        })
    }, [])
    return <></>
}