import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles';
import { setCredentials } from '../../store/authSlice';
import { useAppDispatch } from '../../store/hooks';

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      setCredentials({
        token: 'development-token',
        user: {
          id: 1,
          name: 'School Chairman',
          email: 'chairman@school.local',
          role: ROLES.CHAIRMAN,
          department_id: null
        }
      })
    );
    navigate('/chairman', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#F1F4F9] px-6 py-10 text-[#1E293B]">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase text-[#185FA5]">School Staff Task Management</p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-[#1E293B]">
            Coordinate school work with clarity.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5B6E8C]">
            Track assignments, approvals, notifications, and reports across leadership and department teams.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-[#EFF2F6] bg-[#FFFFFF] p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-[#1E293B]">Sign in</h2>
          <label className="mt-6 block text-sm font-medium text-[#5B6E8C]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            defaultValue="chairman@school.local"
            className="mt-2 h-11 w-full rounded-md border border-[#EFF2F6] bg-[#F8F9FC] px-3 text-[#1E293B] outline-none focus:border-[#185FA5]"
          />
          <label className="mt-4 block text-sm font-medium text-[#5B6E8C]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            defaultValue="password"
            className="mt-2 h-11 w-full rounded-md border border-[#EFF2F6] bg-[#F8F9FC] px-3 text-[#1E293B] outline-none focus:border-[#185FA5]"
          />
          <button
            type="submit"
            className="mt-6 h-11 w-full rounded-md bg-[#185FA5] px-4 font-semibold text-white"
          >
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
