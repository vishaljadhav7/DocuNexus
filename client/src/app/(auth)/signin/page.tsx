'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { addUser } from '@/features/auth/authSlice';
import { useRouter } from 'next/navigation';

const schema = z.object({
  emailId: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type FormField = z.infer<typeof schema>;

export default function SignIn() {
  const authStatus = useAppSelector(store => store.user.isAuthenticated);
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormField>({
    resolver: zodResolver(schema),
  });  
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  useEffect(() => {
    if(authStatus){
      router.push("/dashboard");
    }
  }, [router, dispatch, authStatus]);

  const onSubmit: SubmitHandler<FormField> = async (data) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, data, {
        withCredentials: true, // Tell Axios to send and receive cookies
    });
      dispatch(addUser(res.data));
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || 'Invalid email or password';
      setError('emailId', { message: errorMessage });
      setError('password', { message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="emailId"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email Address
            </label>
            <input
              {...register('emailId')}
              type="email"
              id="emailId"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors duration-150 bg-white"
              placeholder="Enter your email"
              aria-invalid={errors.emailId ? 'true' : 'false'}
            />
            {errors.emailId && (
              <p className="mt-1.5 text-xs text-red-500">{errors.emailId.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors duration-150 bg-white"
              placeholder="Enter your password"
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition-all duration-150 ease-in-out disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Need an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-150"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}