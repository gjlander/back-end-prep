import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { createPost } from '@/data';
import { useAuth } from '@/context';

type FormData = Omit<Post, '_id' | 'author'>;

const CreatePost = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [{ title, image, content }, setForm] = useState<FormData>({
		title: '',

		image: '',
		content: ''
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			if (!title || !image || !content) {
				throw new Error('All fields are required');
			}
			if (!user?._id) {
				throw new Error('Please sign in to create post');
			}
			setLoading(true);
			const newPost: Post = await createPost({
				title,
				image,
				content,
				author: user._id
			});
			setForm({ title: '', image: '', content: '' });
			navigate(`/post/${newPost._id}`);
		} catch (error: unknown) {
			const message = (error as { message: string }).message;
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			className='md:w-1/2 mx-auto flex flex-col gap-3'
			onSubmit={handleSubmit}
		>
			<div className='flex gap-2 justify-between'>
				<label className='form-control grow'>
					<div className='label-text'>Title</div>
					<input
						name='title'
						value={title}
						onChange={handleChange}
						placeholder='A title for your post...'
						className='input input-bordered w-full'
					/>
				</label>
			</div>
			<label className='form-control w-full'>
				<div className='label-text'>Image URL</div>
				<input
					name='image'
					value={image}
					onChange={handleChange}
					placeholder='The URL of an image for your post...'
					className='input input-bordered w-full'
				/>
			</label>
			<label className='form-control'>
				<div className='label-text'>Content</div>
				<textarea
					name='content'
					value={content}
					onChange={handleChange}
					className='textarea textarea-bordered h-24'
					placeholder='The content of your post...'
				></textarea>
			</label>
			<button
				type='submit'
				className='btn btn-primary self-center'
				disabled={loading}
			>
				Create Post
			</button>
		</form>
	);
};

export default CreatePost;
