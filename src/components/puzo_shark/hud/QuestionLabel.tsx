export const QuestionLabel = (props: { label: string }) => {
    return <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        background: 'rgba(0,0,0,0.4)',
        padding: '10px 30px',
        borderRadius: '15px',
        maxWidth: '70%'
    }}>
        {props.label}
    </div>
}