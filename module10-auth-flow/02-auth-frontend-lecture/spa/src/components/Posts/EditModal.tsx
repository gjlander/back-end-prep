import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { updatePost } from '@/data';
type EditModalProps = {
	_id: string;
	content: string;
	image: string;
	title: string;
	author: string;
	setPosts: Dispatch<SetStateAction<Post[]>>;
};

const EditModal = ({
	_id,
	content,
	image,
	title,
	author,
	setPosts
}: EditModalProps) => {
	const [{ newTitle, newImage, newContent }, setForm] = useState({
		newTitle: title,
		newImage: image,
		newContent: content
	});
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();

			if (!newTitle || !newImage || !newContent)
				throw new Error('All fields are required');
			setLoading(true);
			const updatedPost = await updatePost(_id, {
				title: newTitle,
				author,
				image: newImage,
				content: newContent
			});
			setPosts((prev) =>
				prev.map((post) => (post._id === _id ? updatedPost : post))
			);
		} catch (error) {
			const message = (error as { message: string }).message;
			toast.error(message);
		} finally {
			setIsConfirmed(false);
			setLoading(false);
			document.querySelector<HTMLDialogElement>(`#edit-modal-${_id}`)!.close();
		}
	};
	return (
		<dialog id={`edit-modal-${_id}`} className='modal'>
			<div className='modal-box'>
				<form method='dialog'>
					{/* if there is a button in form, it will close the modal */}
					<button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>
						✕
					</button>
				</form>
				<h3 className='font-bold text-lg'>Edit your post</h3>
				<form
					onSubmit={handleSubmit}
					className='md:w-1/2 mx-auto flex flex-col gap-3'
				>
					<div className='flex gap-2 justify-between'>
						<label className='form-control grow'>
							<div className='label-text'>Title</div>
							<input
								name='newTitle'
								value={newTitle}
								onChange={handleChange}
								placeholder='A title for your post...'
								className='input input-bordered w-full'
							/>
						</label>
					</div>
					<label className='form-control w-full'>
						<div className='label-text'>Image URL</div>
						<input
							name='newImage'
							value={newImage}
							onChange={handleChange}
							placeholder='The URL of an image for your post...'
							className='input input-bordered w-full'
						/>
					</label>
					<label className='form-control'>
						<div className='label-text'>Content</div>
						<textarea
							name='newContent'
							value={newContent}
							onChange={handleChange}
							className='textarea textarea-bordered h-24'
							placeholder='The content of your post...'
						></textarea>
					</label>

					{!isConfirmed ? (
						<button
							onClick={() => setIsConfirmed(true)}
							className='btn btn-primary self-center'
						>
							Edit Post
						</button>
					) : (
						<>
							<p>Are you sure?</p>

							<button
								type='submit'
								disabled={loading}
								className='btn btn-success'
							>
								Confirm
							</button>
						</>
					)}
				</form>
			</div>
		</dialog>
	);
};

export default EditModal;
