import { useSession } from "../../context/SessionContext"

export default function Profile() {
    const { logout } = useSession();
    return <div>
        <p>hello from profile</p>
        <button onClick={logout}>logout</button>
    </div>
}