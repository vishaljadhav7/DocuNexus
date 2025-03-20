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
  userName: z.string().min(4, { message: "Minimum 4 characters required" }),
  emailId: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  isPremium: z.boolean().default(false),
});

type FormField = z.infer<typeof schema>;

export default function SignUp() {
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, data, {
        withCredentials: true, 
      });   
      
      dispatch(addUser(res.data));
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || 'Something went wrong';
      setError('userName', { message: errorMessage });  
      setError('emailId', { message: errorMessage });
      setError('password', { message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
          Create Account
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              {...register("userName")}
              type="text"
              id="username"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors duration-150 bg-white"
              placeholder="Enter username"
            />
            {errors.userName && (
              <p className="mt-1.5 text-xs text-red-500">{errors.userName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              {...register("emailId")}
              type="email"
              id="email"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors duration-150 bg-white"
              placeholder="Enter your email"
            />
            {errors.emailId && (
              <p className="mt-1.5 text-xs text-red-500">{errors.emailId.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3.5 py-2.5 rounded-md border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors duration-150 bg-white"
              placeholder="Create a password"
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input 
              {...register('isPremium')}
              type="checkbox" 
              id="premium"
              className="h-4 w-4 text-indigo-600 border-gray-200 rounded focus:ring-indigo-500"
            />
            <label htmlFor="premium" className="text-sm font-medium text-gray-700">
              Premium Account
            </label>
            {errors.isPremium && (
              <p className="mt-1.5 text-xs text-red-500">{errors.isPremium.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-md font-medium transition-all duration-150 ease-in-out disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/signin" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-150">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}