import styles from './RoundedImage.module.css';

function RoundedImage(props) {
    return (
        <div>
            <img
                src={props.src}
                alt={props.alt}
                className={`${styles.rounded_image} ${styles[props.width]}`}
            />
        </div>
    )
}

// function RoundedImage({ src, alt, width }) {
//     return (
//         <img
//             className={'${styles.rounded_image} ${styles[width]}'}
//             src={src}
//             alt={alt}
//         />
//     )
// }

export default RoundedImage;